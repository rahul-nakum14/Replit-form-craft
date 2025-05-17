import { mongoDbService } from "./mongodb";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/**
 * Storage adapter for MongoDB
 * This provides consistent methods for database operations
 */
export const storage = {
  // User operations
  async createUser(userData: any) {
    return mongoDbService.user.create(userData);
  },

  async getUserByEmail(email: string) {
    return mongoDbService.user.findByEmail(email);
  },

  async getUserById(id: any) {
    // If id is a number (PostgreSQL ID format), handle differently
    if (typeof id === 'number') {
      return mongoDbService.user.findByNumericId(id);
    }
    
    // Otherwise, assume it's a MongoDB ID
    return mongoDbService.user.findById(id);
  },

  async verifyUser(token: string) {
    return mongoDbService.user.verifyEmail(token);
  },

  async updateUser(id: any, userData: any) {
    // Convert numeric id to string id if needed
    if (typeof id === 'number') {
      const user = await mongoDbService.user.findByNumericId(id);
      if (!user) return null;
      id = user._id;
    }
    
    return mongoDbService.user.update(id, userData);
  },

  async updatePassword(id: any, password: string) {
    // Convert numeric id to string id if needed
    if (typeof id === 'number') {
      const user = await mongoDbService.user.findByNumericId(id);
      if (!user) return null;
      id = user._id;
    }
    
    return mongoDbService.user.update(id, { password });
  },

  // Form operations
  async createForm(formData: any) {
    // Convert user ID to MongoDB ObjectId if it's a number
    if (typeof formData.userId === 'number') {
      const user = await mongoDbService.user.findByNumericId(formData.userId);
      if (user) {
        formData.userId = user._id;
      } else {
        throw new Error('User not found');
      }
    }
    
    return mongoDbService.form.create(formData);
  },

  async getFormsByUserId(userId: any) {
    // Convert numeric id to string id if needed
    if (typeof userId === 'number') {
      const user = await mongoDbService.user.findByNumericId(userId);
      if (!user) return [];
      userId = user._id;
    }
    
    return mongoDbService.form.findByUserId(userId);
  },

  async getFormById(id: any, userId?: any) {
    // For MongoDB, we need to convert the id to an ObjectId
    try {
      id = typeof id === 'string' ? id : id.toString();
      
      // If userId is provided, verify ownership
      if (userId) {
        // Convert numeric userId to MongoDB ObjectId if needed
        if (typeof userId === 'number') {
          const user = await mongoDbService.user.findByNumericId(userId);
          if (!user) return null;
          userId = user._id;
        }
        
        const form = await mongoDbService.form.findById(id);
        if (!form || form.userId.toString() !== userId.toString()) {
          return null;
        }
        return form;
      }
      
      return mongoDbService.form.findById(id);
    } catch (error) {
      console.error('Error in getFormById:', error);
      return null;
    }
  },

  async getFormBySlug(slug: string) {
    return mongoDbService.form.findBySlug(slug);
  },

  async updateForm(id: any, formData: any) {
    try {
      id = typeof id === 'string' ? id : id.toString();
      return mongoDbService.form.update(id, formData);
    } catch (error) {
      console.error('Error in updateForm:', error);
      return null;
    }
  },

  async deleteForm(id: any) {
    try {
      id = typeof id === 'string' ? id : id.toString();
      return mongoDbService.form.delete(id);
    } catch (error) {
      console.error('Error in deleteForm:', error);
      return false;
    }
  },

  // Form submission operations
  async createSubmission(submissionData: any) {
    // Convert formId to MongoDB ObjectId if it's a number
    if (typeof submissionData.formId === 'number') {
      const form = await this.getFormById(submissionData.formId);
      if (form) {
        submissionData.formId = form._id;
      } else {
        throw new Error('Form not found');
      }
    }
    
    const submission = await mongoDbService.submission.create(submissionData);
    
    // Update analytics after submission
    if (submission) {
      await mongoDbService.analytics.incrementSubmissions(submission.formId);
    }
    
    return submission;
  },

  async getFormSubmissions(formId: any) {
    try {
      // Convert numeric formId to MongoDB ObjectId if needed
      if (typeof formId === 'number') {
        const form = await this.getFormById(formId);
        if (!form) return [];
        formId = form._id;
      }
      
      const submissions = await mongoDbService.submission.findByFormId(formId);
      
      // Add form information to each submission
      const form = await mongoDbService.form.findById(formId);
      
      return submissions.map(sub => {
        const plainSub = sub.toObject();
        return {
          ...plainSub,
          form: form ? {
            title: form.title,
            description: form.description
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error in getFormSubmissions:', error);
      return [];
    }
  },

  // Analytics operations
  async getFormAnalytics(formId: any) {
    try {
      // Convert numeric formId to MongoDB ObjectId if needed
      if (typeof formId === 'number') {
        const form = await this.getFormById(formId);
        if (!form) return null;
        formId = form._id;
      }
      
      // Get analytics data
      const analytics = await mongoDbService.analytics.findByFormId(formId);
      
      // Get submissions for this form
      const submissions = await this.getFormSubmissions(formId);
      
      return {
        analytics,
        submissions
      };
    } catch (error) {
      console.error('Error in getFormAnalytics:', error);
      return null;
    }
  },

  async updateFormAnalytics(formId: any, analyticsData: any) {
    try {
      // Convert numeric formId to MongoDB ObjectId if needed
      if (typeof formId === 'number') {
        const form = await this.getFormById(formId);
        if (!form) return null;
        formId = form._id;
      }
      
      // Get current analytics
      let analytics = await mongoDbService.analytics.findByFormId(formId);
      
      if (!analytics) {
        // Create new analytics if not exists
        analytics = await mongoDbService.analytics.findByFormId(formId);
      }
      
      // Update analytics fields
      Object.assign(analytics, {
        ...analyticsData,
        updatedAt: new Date()
      });
      
      await analytics.save();
      return analytics;
    } catch (error) {
      console.error('Error in updateFormAnalytics:', error);
      return null;
    }
  },

  // Stripe related operations
  async updateStripeCustomerId(userId: any, customerId: string) {
    // Convert numeric userId to MongoDB ObjectId if needed
    if (typeof userId === 'number') {
      const user = await mongoDbService.user.findByNumericId(userId);
      if (!user) return null;
      userId = user._id;
    }
    
    return mongoDbService.user.update(userId, { 
      stripeCustomerId: customerId,
      updatedAt: new Date()
    });
  },

  async updateUserStripeInfo(userId: any, stripeInfo: { customerId: string, subscriptionId: string }) {
    // Convert numeric userId to MongoDB ObjectId if needed
    if (typeof userId === 'number') {
      const user = await mongoDbService.user.findByNumericId(userId);
      if (!user) return null;
      userId = user._id;
    }
    
    return mongoDbService.user.updateStripeInfo(userId, stripeInfo);
  }
};