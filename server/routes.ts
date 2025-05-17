import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { storage } from "./storage";

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET not set, using a default secret for development");
}

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("Email credentials not set, email functionality will not work");
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not set, payment functionality will not work");
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Email Config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

// Stripe Config
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as any }) 
  : null;

// Auth Middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number | string };
      
      // Use storage adapter to get user (works with both PostgreSQL and MongoDB)
      const user = await storage.getUserById(decoded.userId);
      
      if (!user) {
        console.log(`User not found with ID: ${decoded.userId}`);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Attach user to request
      (req as any).user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      
      // For development only: Bypass authentication when there's a JWT error
      if (process.env.NODE_ENV !== 'production') {
        console.log('Development mode: Authentication bypass initiated');
        try {
          // In development, just get the first user
          const user = await storage.getUserById(1);
          if (user) {
            console.log('Using first user for development authentication bypass');
            (req as any).user = user;
            return next();
          }
        } catch (fallbackError) {
          console.error("Fallback authentication failed:", fallbackError);
        }
      }
      
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";
  
  // User Auth Routes
  app.post(`${apiPrefix}/register`, async (req, res) => {
    try {
      const { email, username, password, firstName, lastName } = req.body;
      
      // Validate input
      if (!email || !username || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if user already exists by email
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }
      
      // Check if username is already taken
      const existingUserByUsername = await storage.getUserByEmail(username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      // Create verification token
      const verificationToken = uuidv4();
      
      // Create user with MongoDB
      // Note: Password hashing is handled by the User model pre-save hook
      const newUser = await storage.createUser({
        email,
        username,
        password, // Will be hashed by the pre-save hook
        firstName,
        lastName,
        verificationToken,
        isVerified: false,
        planType: "free",
      });
      
      // Send verification email
      const verificationLink = `${req.protocol}://${req.get("host")}${apiPrefix}/verify-email?token=${verificationToken}`;
      
      // Use the email service from server/services/email.ts
      const { sendVerificationEmail } = require('./services/email');
      try {
        const emailSent = await sendVerificationEmail(email, verificationToken);
        if (emailSent) {
          console.log('Verification email sent successfully');
        } else {
          console.warn('Failed to send verification email. Check SMTP or SendGrid settings.');
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
      
      return res.status(201).json({ 
        message: "User registered, verification email sent",
        userId: newUser.id
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(`${apiPrefix}/login`, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check password (MongoDB user model has comparePassword method)
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if verified
      if (!user.isVerified) {
        return res.status(403).json({ message: "Email not verified" });
      }
      
      // Generate token using MongoDB _id
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
      
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          planType: user.planType
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/verify-email`, async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid token" });
      }
      
      // Verify user with MongoDB
      const updatedUser = await storage.verifyUser(token);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Invalid or expired token" });
      }
      
      return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/user`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      return res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        planType: user.planType
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Form Routes
  app.post(`${apiPrefix}/forms`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { title, description, fields, settings } = req.body;
      
      // Validate input
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      // For free plan users, check if they've reached their limit of 3 forms
      if (user.planType === "free") {
        // Get forms count for this user from MongoDB
        const userForms = await storage.getFormsByUserId(user._id);
        
        if (userForms.length >= 3) {
          return res.status(403).json({ 
            message: "Free plan users are limited to 3 forms. Please upgrade to continue."
          });
        }
      }
      
      // Generate slug from title
      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      // Check for duplicate slug - MongoDB implementation
      const existingForm = await storage.getFormBySlug(slug);
      
      if (existingForm) {
        // Append random string to make slug unique
        slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
      }
      
      // Create form in MongoDB
      const newForm = await storage.createForm({
        userId: user._id,
        title,
        description,
        slug,
        fields: fields || [],
        settings: settings || {
          theme: 'light',
          submitButtonText: 'Submit',
          successMessage: 'Form submitted successfully!'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return res.status(201).json(newForm);
    } catch (error) {
      console.error("Create form error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/forms`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Get user forms from MongoDB
      const userForms = await storage.getFormsByUserId(user._id);
      
      return res.status(200).json(userForms);
    } catch (error) {
      console.error("Get forms error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/forms/:id`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const formId = req.params.id;
      
      if (!formId) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      // Get form from MongoDB, checking that it belongs to the user
      const form = await storage.getFormById(formId, user._id);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      return res.status(200).json(form);
    } catch (error) {
      console.error("Get form error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put(`${apiPrefix}/forms/:id`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const formId = req.params.id;
      const { title, description, fields, settings, isPublished, expiresAt } = req.body;
      
      if (!formId) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      // Check if form exists and belongs to user
      const existingForm = await storage.getFormById(formId, user._id);
      
      if (!existingForm) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Update form with MongoDB
      const updatedForm = await storage.updateForm(formId, {
        title: title || existingForm.title,
        description,
        fields: fields || existingForm.fields,
        settings: settings || existingForm.settings,
        isPublished: isPublished !== undefined ? isPublished : existingForm.isPublished,
        expiresAt: expiresAt || existingForm.expiresAt,
        updatedAt: new Date()
      });
      
      return res.status(200).json(updatedForm);
    } catch (error) {
      console.error("Update form error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete(`${apiPrefix}/forms/:id`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const formId = req.params.id;
      
      if (!formId) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      // Check if form exists and belongs to user
      const existingForm = await storage.getFormById(formId, user._id);
      
      if (!existingForm) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Delete form (this will cascade delete related submissions and analytics in MongoDB)
      await storage.deleteForm(formId);
      
      return res.status(200).json({ message: "Form deleted successfully" });
    } catch (error) {
      console.error("Delete form error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Form analytics route
  app.get(`${apiPrefix}/forms/:id/analytics`, authenticate, async (req, res) => {
    try {
      const formId = req.params.id;
      const user = (req as any).user;
      
      if (!formId) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      // Check if form exists and belongs to user
      const existingForm = await storage.getFormById(formId, user._id);
      
      if (!existingForm) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Get analytics data
      const analyticsData = await storage.getFormAnalytics(formId);
      
      return res.status(200).json(analyticsData);
    } catch (error) {
      console.error("Get form analytics error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Public form submission route
  app.get(`${apiPrefix}/public/forms/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Get form by slug from MongoDB
      const form = await storage.getFormBySlug(slug);
      
      if (!form || !form.isPublished) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check expiration
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        return res.status(403).json({ message: "This form has expired" });
      }
      
      // Get the current analytics
      const analytics = await storage.getFormAnalytics(form._id);
      
      // Update view count using the incrementViews method from mongodb service
      try {
        const { mongoDbService } = require('./services/mongodb');
        await mongoDbService.analytics.incrementViews(form._id.toString());
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
      
      // Return form without sensitive data
      const publicForm = {
        id: form._id,
        title: form.title,
        description: form.description,
        fields: form.fields,
        settings: form.settings
      };
      
      return res.status(200).json(publicForm);
    } catch (error) {
      console.error("Get public form error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(`${apiPrefix}/public/forms/:slug/submit`, async (req, res) => {
    try {
      const { slug } = req.params;
      const formData = req.body;
      
      if (!formData) {
        return res.status(400).json({ message: "Form data is required" });
      }
      
      // Get form by slug from MongoDB
      const form = await storage.getFormBySlug(slug);
      
      if (!form || !form.isPublished) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check expiration
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        return res.status(403).json({ message: "This form has expired" });
      }
      
      // Get the form owner to check plan type
      const formOwner = await storage.getUserById(form.userId);
      
      if (!formOwner) {
        return res.status(404).json({ message: "Form owner not found" });
      }
      
      // Get current analytics to check submission count for free users
      const analytics = await storage.getFormAnalytics(form._id);
      // Get the current submissions count from analytics
      let currentSubmissions = 0;
      if (analytics && analytics.analytics) {
        currentSubmissions = analytics.analytics.submissions || 0;
      }
      
      // If user is on free plan and has reached 100 submissions, reject the submission
      if (formOwner.planType === 'free' && currentSubmissions >= 100) {
        return res.status(403).json({ 
          message: "This form has reached the maximum submissions limit for the free plan",
          limitReached: true
        });
      }
      
      // Create submission in MongoDB
      await storage.createSubmission({
        formId: form._id,
        data: formData,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        submittedAt: new Date()
      });
      
      // Update analytics using the incrementSubmissions method
      try {
        const { mongoDbService } = require('./services/mongodb');
        await mongoDbService.analytics.incrementSubmissions(form._id.toString());
      } catch (err) {
        console.error("Failed to increment submissions:", err);
      }
      
      return res.status(200).json({ message: "Form submitted successfully" });
    } catch (error) {
      console.error("Submit form error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Form Analytics Routes
  app.get(`${apiPrefix}/forms/:id/analytics`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const formId = req.params.id;
      
      if (!formId) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      // Check if form exists and belongs to user
      const existingForm = await storage.getFormById(formId, user._id);
      
      if (!existingForm) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Get analytics
      const analytics = await storage.getFormAnalytics(formId);
      
      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found" });
      }
      
      // Get submissions for this form
      const submissions = await storage.getFormSubmissions(formId);
      
      return res.status(200).json({
        analytics,
        submissions
      });
    } catch (error) {
      console.error("Get form analytics error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Profile & Settings Routes
  app.put(`${apiPrefix}/user/profile`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { firstName, lastName, email, username } = req.body;
      
      // Validate email uniqueness if changed
      if (email && email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        
        if (existingUser) {
          return res.status(409).json({ message: "Email already in use" });
        }
      }
      
      // Validate username uniqueness if changed
      if (username && username !== user.username) {
        // For MongoDB, we'd need a specific function for this
        // For now, just assuming email uniqueness is sufficient
        const existingUser = await db.query.users.findFirst({
          where: eq(users.username, username)
        });
        
        if (existingUser) {
          return res.status(409).json({ message: "Username already in use" });
        }
      }
      
      // Update user with storage adapter
      const updatedUser = await storage.updateUser(user.id, {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        username: username || user.username
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        planType: updatedUser.planType
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put(`${apiPrefix}/user/password`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      await db.update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Subscription & Payment Routes
  app.post(`${apiPrefix}/create-subscription`, authenticate, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const user = (req as any).user;
      
      // If user already has a subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // Need to handle the case where latest_invoice might be string or Invoice object
        const invoice = typeof subscription.latest_invoice === 'string'
          ? await stripe.invoices.retrieve(subscription.latest_invoice)
          : subscription.latest_invoice;
            
        // Then check if there's a payment_intent
        const paymentIntent = invoice?.payment_intent;
        const clientSecret = typeof paymentIntent === 'string'
          ? (await stripe.paymentIntents.retrieve(paymentIntent)).client_secret
          : paymentIntent?.client_secret;
            
        return res.send({
          subscriptionId: subscription.id,
          clientSecret: clientSecret,
        });
      }
      
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
      
      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, user.id));
      
      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID, // This should be set in env vars
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Update user with subscription info
      await db.update(users)
        .set({ 
          stripeSubscriptionId: subscription.id,
          planType: "pro" // Will be updated once payment is successful
        })
        .where(eq(users.id, user.id));
      
      // Need to handle the case where latest_invoice might be string or Invoice object
      const invoice = typeof subscription.latest_invoice === 'string'
        ? await stripe.invoices.retrieve(subscription.latest_invoice)
        : subscription.latest_invoice;
          
      // Then check if there's a payment_intent
      const paymentIntent = invoice?.payment_intent;
      const clientSecret = typeof paymentIntent === 'string'
        ? (await stripe.paymentIntents.retrieve(paymentIntent)).client_secret
        : paymentIntent?.client_secret;
          
      return res.send({
        subscriptionId: subscription.id,
        clientSecret: clientSecret,
      });
    } catch (error) {
      console.error("Create subscription error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(`${apiPrefix}/subscription-webhook`, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!endpointSecret) {
        return res.status(500).json({ message: "Webhook secret not configured" });
      }
      
      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
      
      // Handle specific events
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        
        // Update user's subscription status
        if (session.customer) {
          const user = await db.query.users.findFirst({
            where: eq(users.stripeCustomerId, session.customer)
          });
          
          if (user) {
            await db.update(users)
              .set({ planType: "pro" })
              .where(eq(users.id, user.id));
          }
        }
      } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        
        // Downgrade user to free plan
        const user = await db.query.users.findFirst({
          where: eq(users.stripeSubscriptionId, subscription.id)
        });
        
        if (user) {
          await db.update(users)
            .set({ 
              planType: "free",
              stripeSubscriptionId: null
            })
            .where(eq(users.id, user.id));
        }
      }
      
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
  
  // Payment Routes
  app.post(`${apiPrefix}/create-payment-intent`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { amount } = req.body;
      
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      // Check if user has an existing subscription
      if (user.planType === "pro" && user.stripeSubscriptionId) {
        return res.status(400).json({ 
          message: "You already have an active subscription" 
        });
      }
      
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: "usd",
        metadata: {
          userId: user.id.toString(),
          planType: "pro"
        },
      });
      
      return res.status(200).json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error("Create payment intent error:", error);
      return res.status(500).json({ message: error.message || "Error creating payment intent" });
    }
  });
  
  app.post(`${apiPrefix}/verify-payment`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { paymentIntentId } = req.body;
      
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      // Retrieve the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Check if payment was successful
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment was not successful" });
      }
      
      // Check if this payment is for this user
      if (paymentIntent.metadata.userId !== user.id.toString()) {
        return res.status(403).json({ message: "Unauthorized payment" });
      }
      
      // Get or create customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        customerId = customer.id;
      }
      
      // Create a subscription using the payment method from the payment intent
      const paymentMethod = paymentIntent.payment_method;
      
      if (!paymentMethod) {
        return res.status(400).json({ message: "No payment method found" });
      }
      
      // Attach payment method to customer if not already attached
      try {
        await stripe.paymentMethods.attach(paymentMethod.toString(), {
          customer: customerId,
        });
      } catch (err) {
        // It's already attached, continue
      }
      
      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.toString(),
        },
      });
      
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: process.env.STRIPE_PRICE_ID || 'price_1NzZL2CxjdWdpT9iomYQq9MD', // Default price ID
          },
        ],
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Update user in database
      await db.update(users)
        .set({
          planType: "pro",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      
      return res.status(200).json({
        success: true,
        message: "Subscription activated successfully"
      });
    } catch (error: any) {
      console.error("Verify payment error:", error);
      return res.status(500).json({ message: error.message || "Error verifying payment" });
    }
  });
  
  // Admin Routes (if time permits)
  
  const httpServer = createServer(app);
  return httpServer;
}
