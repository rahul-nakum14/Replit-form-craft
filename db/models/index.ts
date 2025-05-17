import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// User Model
export interface IUser extends Document {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  planType: 'free' | 'pro';
  isVerified: boolean;
  verificationToken?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  password: { type: String, required: true },
  planType: { type: String, enum: ['free', 'pro'], default: 'free' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Form Element Interface
export interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | boolean;
  [key: string]: any;
}

// Form Settings Interface
export interface FormSettings {
  theme: string;
  submitButtonText: string;
  successMessage: string;
  [key: string]: any;
}

// Form Model
export interface IForm extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  slug: string;
  isPublished: boolean;
  expiresAt?: Date;
  fields: FormElement[];
  settings: FormSettings;
  createdAt: Date;
  updatedAt: Date;
}

const FormSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  isPublished: { type: Boolean, default: false },
  expiresAt: { type: Date },
  fields: { type: [Schema.Types.Mixed], required: true },
  settings: {
    type: {
      theme: { type: String, default: 'light' },
      submitButtonText: { type: String, default: 'Submit' },
      successMessage: { type: String, default: 'Form submitted successfully!' }
    },
    default: {
      theme: 'light',
      submitButtonText: 'Submit',
      successMessage: 'Form submitted successfully!'
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Form Submission Model
export interface IFormSubmission extends Document {
  formId: mongoose.Types.ObjectId;
  data: Record<string, any>;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const FormSubmissionSchema: Schema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  data: { type: Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
});

// Form Analytics Model
export interface IFormAnalytics extends Document {
  formId: mongoose.Types.ObjectId;
  views: number;
  submissions: number;
  conversionRate: number;
  averageCompletionTime?: number;
  updatedAt: Date;
}

const FormAnalyticsSchema: Schema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  views: { type: Number, default: 0 },
  submissions: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  averageCompletionTime: { type: Number },
  updatedAt: { type: Date, default: Date.now }
});

// Create or get models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Form = mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);
export const FormSubmission = mongoose.models.FormSubmission || mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);
export const FormAnalytics = mongoose.models.FormAnalytics || mongoose.model<IFormAnalytics>('FormAnalytics', FormAnalyticsSchema);