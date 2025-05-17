import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormElement } from "@/lib/utils/form-elements";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface FormPreviewProps {
  title: string;
  description?: string;
  elements: FormElement[];
  settings: {
    theme: string;
    submitButtonText: string;
    successMessage: string;
    [key: string]: any;
  };
}

export function FormPreview({ title, description, elements, settings }: FormPreviewProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle form field change
  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingRequired = elements
      .filter(element => element.required)
      .filter(element => !formData[element.id]);
    
    if (missingRequired.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill out all required fields: ${missingRequired.map(el => el.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    // Show success message
    setIsSubmitted(true);
    toast({
      title: "Form Submitted",
      description: "This is a preview. In a real form, data would be saved.",
    });
  };

  // Reset the form
  const handleReset = () => {
    setFormData({});
    setIsSubmitted(false);
  };

  // Render different form elements based on type
  const renderFormElement = (element: FormElement) => {
    const { id, type, label, placeholder, options, required } = element;
    
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={id}
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'email':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={id}
              type="email"
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'password':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={id}
              type="password"
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={id}
              type="number"
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'tel':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={id}
              type="tel"
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Textarea
              id={id}
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={id} 
              checked={!!formData[id]} 
              onCheckedChange={(checked) => handleChange(id, checked)}
            />
            <Label htmlFor={id} className="cursor-pointer">
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
            <RadioGroup 
              value={formData[id] || ""}
              onValueChange={(value) => handleChange(id, value)}
            >
              {options?.map((option, i) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionValue} id={`${id}-option-${i}`} />
                    <Label htmlFor={`${id}-option-${i}`}>{optionLabel}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Select 
              value={formData[id] || ""} 
              onValueChange={(value) => handleChange(id, value)}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder={placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option, i) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label;
                  return (
                    <SelectItem key={i} value={optionValue}>{optionLabel}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={id}
              type="date"
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={id}
              type="file"
              onChange={(e) => handleChange(id, e.target.files ? e.target.files[0] : null)}
            />
            <p className="text-xs text-gray-500">This is a preview. File uploads will not be processed.</p>
          </div>
        );
        
      default:
        return (
          <div>Unknown element type: {type}</div>
        );
    }
  };

  // Apply theme styles based on settings
  const getThemeStyles = () => {
    switch (settings.theme) {
      case 'blue':
        return 'bg-blue-50';
      case 'green':
        return 'bg-green-50';
      case 'purple':
        return 'bg-purple-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className={getThemeStyles()}>
        <CardHeader>
          <CardTitle className="text-2xl">{title || "Form Preview"}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">{settings.successMessage || "Thank you for your submission!"}</h3>
              <p className="text-gray-500 mb-6">This is a preview. In a real form, data would be saved.</p>
              <Button onClick={handleReset}>Reset Form</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {elements.map((element) => (
                <div key={element.id}>
                  {renderFormElement(element)}
                </div>
              ))}
              
              {elements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No form elements added yet. Add elements in the Form Builder tab.</p>
                </div>
              )}
              
              {elements.length > 0 && (
                <Button 
                  type="submit" 
                  className="w-full"
                >
                  {settings.submitButtonText || "Submit"}
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
