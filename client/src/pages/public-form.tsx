import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Define the form element types
interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  [key: string]: any;
}

interface FormSettings {
  theme: string;
  submitButtonText: string;
  successMessage: string;
  [key: string]: any;
}

interface PublicForm {
  id: string;
  title: string;
  description: string | null;
  fields: FormElement[];
  settings: FormSettings;
}

export default function PublicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState<PublicForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  // Load form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/public/forms/${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load form");
        }
        
        const formData = await response.json();
        setForm(formData);
      } catch (err: any) {
        setError(err.message || "Failed to load form");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) {
      fetchForm();
    }
  }, [slug]);

  // Generate dynamic form schema based on form fields
  const generateFormSchema = () => {
    if (!form || !form.fields) return z.object({});
    
    const schemaObj: Record<string, z.ZodTypeAny> = {};
    
    form.fields.forEach((field) => {
      if (field.type === "text" || field.type === "textarea") {
        let schema = z.string();
        if (field.required) {
          schema = schema.min(1, { message: `${field.label} is required` });
        } else {
          schema = schema.optional();
        }
        schemaObj[field.id] = schema;
      } else if (field.type === "email") {
        let schema = z.string().email({ message: "Invalid email address" });
        if (field.required) {
          schema = schema.min(1, { message: `${field.label} is required` });
        } else {
          schema = schema.optional();
        }
        schemaObj[field.id] = schema;
      } else if (field.type === "number") {
        let schema = z.string().refine(
          (val) => !isNaN(Number(val)),
          { message: "Must be a number" }
        );
        if (field.required) {
          schema = schema.min(1, { message: `${field.label} is required` });
        } else {
          schema = schema.optional();
        }
        schemaObj[field.id] = schema;
      } else if (field.type === "checkbox") {
        schemaObj[field.id] = field.required
          ? z.boolean().refine((val) => val === true, { message: `${field.label} is required` })
          : z.boolean().optional();
      } else if (field.type === "select" || field.type === "radio") {
        let schema = z.string();
        if (field.required) {
          schema = schema.min(1, { message: `${field.label} is required` });
        } else {
          schema = schema.optional();
        }
        schemaObj[field.id] = schema;
      }
    });
    
    return z.object(schemaObj);
  };

  const formSchema = generateFormSchema();
  type FormValues = z.infer<typeof formSchema>;
  
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);
      
      const response = await apiRequest("POST", `/api/public/forms/${slug}/submit`, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.limitReached) {
          setLimitReached(true);
        } else {
          throw new Error(errorData.message || "Failed to submit form");
        }
      } else {
        setIsSubmitted(true);
        formMethods.reset();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit form");
    }
  };

  const renderFormElement = (element: FormElement) => {
    const { id, type, label, placeholder, required, options } = element;
    
    switch (type) {
      case "text":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor={id}>
              {label}{required ? " *" : ""}
            </label>
            <input
              id={id}
              type="text"
              placeholder={placeholder}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              {...formMethods.register(id)}
            />
            {formMethods.formState.errors[id] && (
              <p className="text-red-500 text-sm mt-1">
                {formMethods.formState.errors[id]?.message?.toString()}
              </p>
            )}
          </div>
        );
      
      case "textarea":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor={id}>
              {label}{required ? " *" : ""}
            </label>
            <textarea
              id={id}
              placeholder={placeholder}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              {...formMethods.register(id)}
            ></textarea>
            {formMethods.formState.errors[id] && (
              <p className="text-red-500 text-sm mt-1">
                {formMethods.formState.errors[id]?.message?.toString()}
              </p>
            )}
          </div>
        );
      
      case "email":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor={id}>
              {label}{required ? " *" : ""}
            </label>
            <input
              id={id}
              type="email"
              placeholder={placeholder}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              {...formMethods.register(id)}
            />
            {formMethods.formState.errors[id] && (
              <p className="text-red-500 text-sm mt-1">
                {formMethods.formState.errors[id]?.message?.toString()}
              </p>
            )}
          </div>
        );
      
      case "number":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor={id}>
              {label}{required ? " *" : ""}
            </label>
            <input
              id={id}
              type="number"
              placeholder={placeholder}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              {...formMethods.register(id)}
            />
            {formMethods.formState.errors[id] && (
              <p className="text-red-500 text-sm mt-1">
                {formMethods.formState.errors[id]?.message?.toString()}
              </p>
            )}
          </div>
        );
      
      case "checkbox":
        return (
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id={id}
                type="checkbox"
                className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                {...formMethods.register(id)}
              />
              <label className="text-sm font-medium" htmlFor={id}>
                {label}{required ? " *" : ""}
              </label>
            </div>
            {formMethods.formState.errors[id] && (
              <p className="text-red-500 text-sm mt-1">
                {formMethods.formState.errors[id]?.message?.toString()}
              </p>
            )}
          </div>
        );
      
      case "select":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor={id}>
              {label}{required ? " *" : ""}
            </label>
            <select
              id={id}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              {...formMethods.register(id)}
            >
              <option value="">Select an option</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formMethods.formState.errors[id] && (
              <p className="text-red-500 text-sm mt-1">
                {formMethods.formState.errors[id]?.message?.toString()}
              </p>
            )}
          </div>
        );
      
      case "radio":
        return (
          <div className="mb-4">
            <fieldset>
              <legend className="text-sm font-medium mb-1">
                {label}{required ? " *" : ""}
              </legend>
              <div className="space-y-2">
                {options?.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      id={`${id}-${option.value}`}
                      type="radio"
                      value={option.value}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      {...formMethods.register(id)}
                    />
                    <label className="text-sm" htmlFor={`${id}-${option.value}`}>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {formMethods.formState.errors[id] && (
                <p className="text-red-500 text-sm mt-1">
                  {formMethods.formState.errors[id]?.message?.toString()}
                </p>
              )}
            </fieldset>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Get theme styles based on form settings
  const getThemeStyles = () => {
    if (!form || !form.settings) return "";
    
    const theme = form.settings.theme || "light";
    
    switch (theme) {
      case "dark":
        return "bg-gray-800 text-white";
      case "blue":
        return "bg-blue-50";
      case "green":
        return "bg-green-50";
      default:
        return "bg-white";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-xl text-red-700 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Error Loading Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600">{error}</p>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
            <p className="text-sm text-gray-500">
              Please try again later or contact the form owner.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-xl text-amber-700 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Submission Limit Reached
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              This form has reached the maximum number of submissions allowed on the free plan.
            </p>
            <p className="text-gray-600">
              The form owner needs to upgrade to the Pro plan to receive more submissions.
            </p>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
            <p className="text-sm text-gray-500">
              Please contact the form owner for more information.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Form Not Found</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600">
              The form you're looking for doesn't exist or has been unpublished.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4">
      <Card className={`w-full max-w-3xl mx-auto shadow-lg ${getThemeStyles()}`}>
        <CardHeader>
          <CardTitle className="text-xl">{form.title}</CardTitle>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-6">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                {form.settings?.successMessage || "Thank you for your submission!"}
              </h3>
            </div>
          ) : (
            <Form {...formMethods}>
              <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
                {form.fields.map((element) => (
                  <div key={element.id}>{renderFormElement(element)}</div>
                ))}
                
                {error && (
                  <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={formMethods.formState.isSubmitting}>
                    {formMethods.formState.isSubmitting ? "Submitting..." : (form.settings?.submitButtonText || "Submit")}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-100 p-4 text-center">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold">FormCraft</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}