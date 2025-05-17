import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/auth-context';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Loader2 } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { updateUserProfile } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get query params
        const params = new URLSearchParams(window.location.search);
        const paymentIntentId = params.get('payment_intent');
        const paymentIntentClientSecret = params.get('payment_intent_client_secret');
        
        if (!paymentIntentId || !paymentIntentClientSecret) {
          throw new Error('Missing payment information');
        }
        
        // Verify the payment with our backend
        const response = await apiRequest('POST', '/api/verify-payment', {
          paymentIntentId,
          paymentIntentClientSecret
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to verify payment');
        }
        
        const data = await response.json();
        
        // Update the user profile with pro plan
        updateUserProfile({ planType: 'pro' });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'An error occurred while processing your payment');
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [updateUserProfile]);
  
  return (
    <div className="container max-w-lg mx-auto py-16">
      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            {loading ? 'Processing Your Payment' : error ? 'Payment Error' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription>
            {loading 
              ? 'Please wait while we verify your payment...' 
              : error 
                ? 'We encountered an issue with your payment' 
                : 'Your subscription to FormCraft Pro has been activated'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-8 px-6">
          {loading ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          ) : error ? (
            <div className="text-center">
              <div className="rounded-full bg-red-100 p-3 mx-auto w-fit mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-sm text-gray-600">
                Please contact our support team if you believe this is a mistake.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-fit mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Welcome to FormCraft Pro!</h3>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600">
                  You now have access to all premium features:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited forms
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Custom branding options
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6">
          <Button 
            onClick={() => setLocation('/dashboard')}
            disabled={loading}
            variant={error ? "outline" : "default"}
          >
            {error ? 'Return to Dashboard' : 'Start Creating Forms'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}