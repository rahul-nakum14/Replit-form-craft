import { connectToMongoDB, disconnectFromMongoDB } from '../../db/mongodb';
import { 
  User, 
  Form, 
  FormSubmission, 
  FormAnalytics, 
  IUser, 
  IForm, 
  IFormSubmission, 
  IFormAnalytics 
} from '../../db/models';

// Connect to MongoDB when the server starts
connectToMongoDB().catch((err: Error) => console.error('MongoDB connection error:', err));

/**
 * User related operations
 */
export const userService = {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  },

  async findById(id: string): Promise<IUser | null> {
    if (!id) return null;
    return await User.findById(id);
  },

  async findByNumericId(id: number): Promise<IUser | null> {
    if (!id) return null;
    // Convert numeric ID to string for MongoDB
    // This is a fallback for compatibility
    return await User.findOne().skip(id - 1).limit(1);
  },

  async findFirst(): Promise<IUser | null> {
    return await User.findOne();
  },

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return await User.findOne({ verificationToken: token });
  },

  async create(userData: any): Promise<IUser> {
    return await User.create(userData);
  },

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { ...userData, updatedAt: new Date() },
      { new: true }
    );
  },

  async verifyEmail(token: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { verificationToken: token },
      { isVerified: true, verificationToken: null, updatedAt: new Date() },
      { new: true }
    );
  },
  
  async updateStripeInfo(id: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { 
        stripeCustomerId: stripeInfo.customerId,
        stripeSubscriptionId: stripeInfo.subscriptionId,
        planType: 'pro',
        updatedAt: new Date()
      },
      { new: true }
    );
  },
};

/**
 * Form related operations
 */
export const formService = {
  async findById(id: string): Promise<IForm | null> {
    if (!id) return null;
    return await Form.findById(id);
  },

  async findBySlug(slug: string): Promise<IForm | null> {
    return await Form.findOne({ slug });
  },

  async findByUserId(userId: string): Promise<IForm[]> {
    return await Form.find({ userId }).sort({ updatedAt: -1 });
  },

  async countByUserId(userId: string): Promise<number> {
    return await Form.countDocuments({ userId });
  },

  async create(formData: any): Promise<IForm> {
    return await Form.create(formData);
  },

  async update(id: string, formData: Partial<IForm>): Promise<IForm | null> {
    return await Form.findByIdAndUpdate(
      id,
      { ...formData, updatedAt: new Date() },
      { new: true }
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await Form.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
};

/**
 * Form submission related operations
 */
export const submissionService = {
  async create(submissionData: any): Promise<IFormSubmission> {
    return await FormSubmission.create(submissionData);
  },

  async findByFormId(formId: string): Promise<IFormSubmission[]> {
    return await FormSubmission.find({ formId }).sort({ submittedAt: -1 });
  }
};

/**
 * Analytics related operations
 */
export const analyticsService = {
  async findByFormId(formId: string): Promise<IFormAnalytics | null> {
    let analytics = await FormAnalytics.findOne({ formId });
    
    if (!analytics) {
      // Create new analytics record if not exists
      analytics = await FormAnalytics.create({
        formId,
        views: 0,
        submissions: 0,
        conversionRate: 0,
        updatedAt: new Date()
      });
    }
    
    return analytics;
  },

  async incrementViews(formId: string): Promise<IFormAnalytics | null> {
    let analytics = await FormAnalytics.findOne({ formId });
    
    if (!analytics) {
      analytics = await FormAnalytics.create({
        formId,
        views: 1,
        submissions: 0,
        conversionRate: 0,
        updatedAt: new Date()
      });
      
      return analytics;
    }
    
    analytics.views += 1;
    
    // Calculate conversion rate
    if (analytics.views > 0 && analytics.submissions > 0) {
      analytics.conversionRate = (analytics.submissions / analytics.views) * 100;
    }
    
    analytics.updatedAt = new Date();
    await analytics.save();
    
    return analytics;
  },
  
  async incrementSubmissions(formId: string): Promise<IFormAnalytics | null> {
    let analytics = await FormAnalytics.findOne({ formId });
    
    if (!analytics) {
      analytics = await FormAnalytics.create({
        formId,
        views: 0,
        submissions: 1,
        conversionRate: 0,
        updatedAt: new Date()
      });
      
      return analytics;
    }
    
    analytics.submissions += 1;
    
    // Calculate conversion rate
    if (analytics.views > 0) {
      analytics.conversionRate = (analytics.submissions / analytics.views) * 100;
    }
    
    analytics.updatedAt = new Date();
    await analytics.save();
    
    return analytics;
  }
};

export const mongoDbService = {
  user: userService,
  form: formService,
  submission: submissionService,
  analytics: analyticsService
};