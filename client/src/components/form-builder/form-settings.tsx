import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormSettingsProps {
  description: string;
  setDescription: (description: string) => void;
  settings: {
    theme: string;
    submitButtonText: string;
    successMessage: string;
    [key: string]: any;
  };
  setSettings: (settings: any) => void;
  expiresAt: Date | null;
  setExpiresAt: (date: Date | null) => void;
  formSlug: string;
}

export function FormSettings({
  description,
  setDescription,
  settings,
  setSettings,
  expiresAt,
  setExpiresAt,
  formSlug
}: FormSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isPro = user?.planType === "pro";

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/f/${formSlug}" width="100%" height="500" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied to clipboard",
      description: "Embed code has been copied to your clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Form Settings</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your form"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This description will be displayed to users before they fill out your form.
              </p>
            </div>
            
            <div>
              <Label htmlFor="form-theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => handleSettingChange("theme", value)}
              >
                <SelectTrigger id="form-theme" className="mt-1">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  {isPro && (
                    <>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {!isPro && settings.theme !== "light" && settings.theme !== "dark" && settings.theme !== "system" && (
                <p className="text-xs text-amber-500 mt-1">
                  Note: Only Light, Dark, and System themes are available on the Free plan.
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="submit-button-text">Submit Button Text</Label>
              <Input
                id="submit-button-text"
                value={settings.submitButtonText}
                onChange={(e) => handleSettingChange("submitButtonText", e.target.value)}
                placeholder="Submit"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="success-message">Success Message</Label>
              <Textarea
                id="success-message"
                value={settings.successMessage}
                onChange={(e) => handleSettingChange("successMessage", e.target.value)}
                placeholder="Thank you for your submission!"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="form-expiration">Form Expiration</Label>
              <div className="mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!expiresAt ? 'text-muted-foreground' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt ? format(expiresAt, "PPP") : "No expiration"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiresAt || undefined}
                      onSelect={setExpiresAt}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {!isPro && (
                  <p className="text-xs text-amber-500 mt-1 flex items-center">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 mr-1">PRO</span>
                    Form expiration is only available in the Pro plan
                  </p>
                )}
                {expiresAt && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setExpiresAt(null)}
                  >
                    Clear expiration date
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-email">Require Email</Label>
                <p className="text-xs text-gray-500">
                  Collect respondent's email address
                </p>
              </div>
              <Switch
                id="require-email"
                checked={settings.requireEmail || false}
                onCheckedChange={(checked) => handleSettingChange("requireEmail", checked)}
                disabled={!isPro}
              />
              {!isPro && (
                <div className="absolute right-0 -mt-6">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary">Pro</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Embed Form</h3>
          
          <div>
            <Label htmlFor="form-slug">Public Form URL</Label>
            <div className="flex mt-1">
              <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {window.location.origin}/f/
              </div>
              <Input
                id="form-slug"
                value={formSlug}
                readOnly
                className="rounded-l-none"
              />
              <Button
                size="sm"
                variant="outline"
                className="ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/f/${formSlug}`);
                  toast({
                    title: "Copied to clipboard",
                    description: "Public form URL has been copied to your clipboard",
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is the direct URL you can share with your form recipients.
            </p>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="embed-code">Embed Code</Label>
            <div className="mt-1 relative">
              <Textarea
                id="embed-code"
                value={`<iframe src="${window.location.origin}/f/${formSlug}" width="100%" height="500" frameborder="0"></iframe>`}
                readOnly
                className="bg-gray-50 font-mono text-xs"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 bottom-2"
                onClick={copyEmbedCode}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-captcha">Enable CAPTCHA</Label>
                <p className="text-xs text-gray-500">
                  Protect your form from spam submissions
                </p>
              </div>
              <Switch
                id="enable-captcha"
                checked={settings.enableCaptcha || false}
                onCheckedChange={(checked) => handleSettingChange("enableCaptcha", checked)}
                disabled={!isPro}
              />
              {!isPro && (
                <div className="absolute right-0 -mt-6">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary">Pro</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-redirect">Enable Redirect After Submit</Label>
                <p className="text-xs text-gray-500">
                  Redirect users after form submission
                </p>
              </div>
              <Switch
                id="enable-redirect"
                checked={settings.enableRedirect || false}
                onCheckedChange={(checked) => handleSettingChange("enableRedirect", checked)}
                disabled={!isPro}
              />
              {!isPro && (
                <div className="absolute right-0 -mt-6">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary">Pro</span>
                </div>
              )}
            </div>
            
            {settings.enableRedirect && (
              <div className="ml-6 mt-2">
                <Label htmlFor="redirect-url">Redirect URL</Label>
                <Input
                  id="redirect-url"
                  value={settings.redirectUrl || ""}
                  onChange={(e) => handleSettingChange("redirectUrl", e.target.value)}
                  placeholder="https://example.com/thank-you"
                  className="mt-1"
                  disabled={!isPro}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-email-notifications">Email Notifications</Label>
                <p className="text-xs text-gray-500">
                  Get notified when someone submits this form
                </p>
              </div>
              <Switch
                id="enable-email-notifications"
                checked={settings.enableEmailNotifications || false}
                onCheckedChange={(checked) => handleSettingChange("enableEmailNotifications", checked)}
                disabled={!isPro}
              />
              {!isPro && (
                <div className="absolute right-0 -mt-6">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary">Pro</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
