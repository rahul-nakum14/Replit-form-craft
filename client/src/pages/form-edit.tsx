import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FormBuilder } from "@/components/form-builder/form-builder";
import { FormSettings } from "@/components/form-builder/form-settings";
import { FormPreview } from "@/components/form-builder/form-preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { FormElement } from "@/lib/utils/form-elements";
import { Loader2, Save, Eye, Settings as SettingsIcon } from "lucide-react";
import { nanoid } from "nanoid";

export default function FormEdit() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNewForm = id === "new";
  // Using string ID for MongoDB instead of numeric
  const formId = isNewForm ? null : id;
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [settings, setSettings] = useState({
    theme: "light",
    submitButtonText: "Submit",
    successMessage: "Thank you for your submission!",
  });
  const [isPublished, setIsPublished] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState("builder");

  // Fetch form if editing existing form
  const { data: formData, isLoading: isLoadingForm } = useQuery<Form>({
    queryKey: [`/api/forms/${formId}`],
    enabled: !isNewForm && !!formId,
  });

  // Update local state when form data is loaded
  useEffect(() => {
    if (formData) {
      console.log("Form data loaded:", formData);
      console.log("Form fields:", formData.fields);
      
      setTitle(formData.title);
      setDescription(formData.description || "");
      
      // Make sure we have an array of form elements
      if (Array.isArray(formData.fields)) {
        console.log("Setting form elements:", formData.fields);
        // Ensure each field has the required properties
        const processedFields = formData.fields.map(field => ({
          id: field.id || nanoid(),
          type: field.type,
          label: field.label || `Field ${field.type}`,
          placeholder: field.placeholder || "",
          required: field.required || false,
          options: field.options || [],
          helpText: field.helpText || "",
          ...field
        }));
        setFormElements(processedFields);
      } else if (typeof formData.fields === 'object' && formData.fields !== null) {
        // Handle case where fields might be stored as an object
        console.log("Converting fields object to array:", formData.fields);
        try {
          const fieldArray = Object.values(formData.fields);
          const processedFields = fieldArray.map(field => ({
            id: field.id || nanoid(),
            type: field.type,
            label: field.label || `Field ${field.type}`,
            placeholder: field.placeholder || "",
            required: field.required || false,
            options: field.options || [],
            helpText: field.helpText || "",
            ...field
          }));
          setFormElements(processedFields);
        } catch (error) {
          console.error("Error converting fields:", error);
          setFormElements([]);
        }
      } else {
        console.warn("Form fields is not an array or object:", formData.fields);
        setFormElements([]);
      }
      
      // Ensure settings are properly loaded
      let formSettings = {
        theme: "light",
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
      };
      
      if (formData.settings) {
        if (typeof formData.settings === 'string') {
          try {
            formSettings = { ...formSettings, ...JSON.parse(formData.settings) };
          } catch (e) {
            console.warn("Failed to parse settings as JSON:", formData.settings);
          }
        } else {
          formSettings = { ...formSettings, ...(formData.settings as any) };
        }
      }
      
      setSettings(formSettings);
      setIsPublished(formData.isPublished);
      setExpiresAt(formData.expiresAt ? new Date(formData.expiresAt) : null);
    }
  }, [formData]);

  // Create or update form mutation
  const saveMutation = useMutation({
    mutationFn: (formData: Partial<Form>) => {
      if (isNewForm) {
        return apiRequest("POST", "/api/forms", formData);
      } else {
        return apiRequest("PUT", `/api/forms/${formId}`, formData);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      
      if (isNewForm) {
        setLocation(`/forms/${data.id}`);
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
      }
      
      toast({
        title: isNewForm ? "Form created" : "Form updated",
        description: isNewForm 
          ? "Your new form has been created successfully" 
          : "Your form has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save form: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Save form
  const handleSave = (publishStatus?: boolean) => {
    const updatedPublishStatus = publishStatus !== undefined ? publishStatus : isPublished;

    const formData = {
      title,
      description,
      fields: formElements,
      settings,
      isPublished: updatedPublishStatus,
      expiresAt,
    };

    saveMutation.mutate(formData);
  };

  // Handle form title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  // Handle form elements change
  const handleFormElementsChange = (elements: FormElement[]) => {
    setFormElements(elements);
  };

  // Title is required
  const isSaveDisabled = !title.trim();

  if (!isNewForm && isLoadingForm) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isNewForm ? "Create Form" : "Edit Form"}
        </h1>
        <div className="space-x-2 flex">
          <Button 
            variant={isPublished ? "outline" : "secondary"}
            onClick={() => handleSave(!isPublished)}
            disabled={isSaveDisabled || saveMutation.isPending}
          >
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button 
            onClick={() => handleSave()}
            disabled={isSaveDisabled || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="builder" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-0">
          <FormBuilder
            title={title}
            onTitleChange={handleTitleChange}
            elements={formElements}
            onChange={handleFormElementsChange}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <FormPreview
            title={title}
            description={description}
            elements={formElements}
            settings={settings}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <FormSettings
            description={description}
            setDescription={setDescription}
            settings={settings}
            setSettings={setSettings}
            expiresAt={expiresAt}
            setExpiresAt={setExpiresAt}
            formSlug={formData?.slug || "your-form-name"}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
