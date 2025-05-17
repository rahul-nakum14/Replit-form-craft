import Stripe from 'stripe';
import { IUser } from '../../db/models';

// Check if Stripe API key is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set, payment functionality will not work');
}

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

// Price IDs for subscription tiers
// In a real app, these would be set as environment variables or stored in the database
const SUBSCRIPTION_PRICES = {
  pro: 'price_monthly_pro', // This should be the actual price ID from Stripe dashboard
};

/**
 * Create a Stripe customer for a user
 */
export async function createCustomer(user: IUser): Promise<string | null> {
  if (!stripe) return null;

  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      metadata: {
        userId: user._id.toString()
      }
    });

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return null;
  }
}

/**
 * Create a subscription for a user
 */
export async function createSubscription(
  customerId: string,
  plan: 'pro' = 'pro'
): Promise<{ subscriptionId: string | null; clientSecret: string | null }> {
  if (!stripe) return { subscriptionId: null, clientSecret: null };

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: SUBSCRIPTION_PRICES[plan],
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // @ts-ignore - The expanded fields are not in the type definitions
    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;

    return {
      subscriptionId: subscription.id,
      clientSecret
    };
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    return { subscriptionId: null, clientSecret: null };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!stripe) return false;

  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error('Error cancelling Stripe subscription:', error);
    return false;
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(
  signature: string, 
  payload: Buffer, 
  endpointSecret: string,
  onSubscriptionUpdated: (userId: string, status: string) => Promise<void>
): Promise<{ success: boolean; message: string }> {
  if (!stripe) {
    return { success: false, message: 'Stripe not configured' };
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (error: any) {
    return { success: false, message: `Webhook signature verification failed: ${error.message}` };
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Fetch customer to get userId from metadata
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata.userId;
        
        if (userId) {
          await onSubscriptionUpdated(
            userId, 
            subscription.status
          );
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        break;
      }
    }

    return { success: true, message: 'Webhook processed successfully' };
  } catch (error: any) {
    return { success: false, message: `Error processing webhook: ${error.message}` };
  }
}