import { apiRequest } from "./queryClient";
import { FormElement } from "./utils/form-elements";

interface FormData {
  title: string;
  description?: string;
  fields: FormElement[];
  settings: {
    theme: string;
    submitButtonText: string;
    successMessage: string;
    [key: string]: any;
  };
  isPublished?: boolean;
  expiresAt?: Date | null;
}

export interface FormResponse {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  slug: string;
  isPublished: boolean;
  expiresAt: string | null;
  fields: FormElement[];
  settings: {
    theme: string;
    submitButtonText: string;
    successMessage: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// Auth API
export async function login(email: string, password: string) {
  const response = await apiRequest("POST", "/api/login", { email, password });
  return response.json();
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const response = await apiRequest("POST", "/api/register", data);
  return response.json();
}

export async function verifyEmail(token: string) {
  const response = await apiRequest("GET", `/api/verify-email?token=${token}`);
  return response.json();
}

export async function getCurrentUser() {
  const response = await apiRequest("GET", "/api/user");
  return response.json();
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}) {
  const response = await apiRequest("PUT", "/api/user/profile", data);
  return response.json();
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const response = await apiRequest("PUT", "/api/user/password", data);
  return response.json();
}

// Forms API
export async function getForms() {
  const response = await apiRequest("GET", "/api/forms");
  return response.json();
}

export async function getFormById(id: number) {
  const response = await apiRequest("GET", `/api/forms/${id}`);
  return response.json();
}

export async function createForm(formData: FormData) {
  const response = await apiRequest("POST", "/api/forms", formData);
  return response.json();
}

export async function updateForm(id: number, formData: Partial<FormData>) {
  const response = await apiRequest("PUT", `/api/forms/${id}`, formData);
  return response.json();
}

export async function deleteForm(id: number) {
  const response = await apiRequest("DELETE", `/api/forms/${id}`);
  return response.json();
}

export async function getPublicForm(slug: string) {
  const response = await apiRequest("GET", `/api/public/forms/${slug}`);
  return response.json();
}

export async function submitForm(slug: string, data: Record<string, any>) {
  const response = await apiRequest("POST", `/api/public/forms/${slug}/submit`, data);
  return response.json();
}

// Analytics API
export async function getFormAnalytics(id: number | string) {
  const response = await apiRequest("GET", `/api/forms/${id}/analytics`);
  return response.json();
}

// Subscription API
export async function createSubscription() {
  const response = await apiRequest("POST", "/api/create-subscription");
  return response.json();
}
