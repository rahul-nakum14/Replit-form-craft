import { z } from "zod";

// Form validation schemas
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: "Username can only contain letters, numbers, and underscores" 
    }),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your new password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const formSchema = z.object({
  title: z.string().min(1, { message: "Form title is required" }),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional(),
      helpText: z.string().optional(),
      rows: z.number().optional(),
      min: z.union([z.string(), z.number()]).optional(),
      max: z.union([z.string(), z.number()]).optional(),
      accept: z.string().optional(),
    })
  ),
  settings: z.object({
    theme: z.string(),
    submitButtonText: z.string(),
    successMessage: z.string(),
    requireEmail: z.boolean().optional(),
    enableCaptcha: z.boolean().optional(),
    enableRedirect: z.boolean().optional(),
    redirectUrl: z.string().optional(),
    enableEmailNotifications: z.boolean().optional(),
  }),
  isPublished: z.boolean().optional(),
  expiresAt: z.date().nullable().optional(),
});

// Helper validation functions
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  return { valid: true };
}

export function validateFormSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

// Form field validation
export function validateFormField(
  type: string,
  value: any,
  options?: { required?: boolean; min?: number; max?: number }
): { valid: boolean; message?: string } {
  const { required = false, min, max } = options || {};
  
  // Check required field
  if (required && (value === undefined || value === null || value === "")) {
    return { valid: false, message: "This field is required" };
  }
  
  // Skip further validation if empty and not required
  if (!required && (value === undefined || value === null || value === "")) {
    return { valid: true };
  }
  
  // Type-specific validation
  switch (type) {
    case "email":
      return { valid: validateEmail(value), message: "Please enter a valid email address" };
      
    case "number":
      const numberValue = Number(value);
      if (isNaN(numberValue)) {
        return { valid: false, message: "Please enter a valid number" };
      }
      if (min !== undefined && numberValue < min) {
        return { valid: false, message: `Value must be at least ${min}` };
      }
      if (max !== undefined && numberValue > max) {
        return { valid: false, message: `Value must be at most ${max}` };
      }
      return { valid: true };
      
    case "tel":
      const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
      return { 
        valid: phoneRegex.test(value), 
        message: "Please enter a valid phone number" 
      };
      
    default:
      return { valid: true };
  }
}
