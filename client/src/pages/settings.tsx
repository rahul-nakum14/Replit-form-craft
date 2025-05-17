import React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [browserNotifications, setBrowserNotifications] = React.useState(false);
  const [formSubmissionNotifications, setFormSubmissionNotifications] = React.useState(true);
  
  // Dark mode has been removed
  const handleThemeChange = () => {};
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base" htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive email notifications about form submissions and account updates
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked);
                  toast({
                    title: `Email notifications ${checked ? "enabled" : "disabled"}`,
                    description: "Your preference has been saved",
                  });
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base" htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive browser notifications when you're online
                </p>
              </div>
              <Switch
                id="browser-notifications"
                checked={browserNotifications}
                onCheckedChange={(checked) => {
                  setBrowserNotifications(checked);
                  
                  if (checked) {
                    // Request browser notification permission
                    if ("Notification" in window) {
                      Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                          toast({
                            title: "Browser notifications enabled",
                            description: "You'll now receive notifications in your browser",
                          });
                        } else {
                          setBrowserNotifications(false);
                          toast({
                            title: "Permission denied",
                            description: "Please enable notifications in your browser settings",
                            variant: "destructive",
                          });
                        }
                      });
                    }
                  } else {
                    toast({
                      title: "Browser notifications disabled",
                      description: "Your preference has been saved",
                    });
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base" htmlFor="form-submission-notifications">Form Submission Notifications</Label>
                <p className="text-sm text-gray-500">
                  Get notified when someone submits one of your forms
                </p>
              </div>
              <Switch
                id="form-submission-notifications"
                checked={formSubmissionNotifications}
                onCheckedChange={(checked) => {
                  setFormSubmissionNotifications(checked);
                  toast({
                    title: `Form submission notifications ${checked ? "enabled" : "disabled"}`,
                    description: "Your preference has been saved",
                  });
                }}
              />
            </div>
            
            <div className="flex items-center justify-between pt-4 opacity-50">
              <div className="space-y-0.5">
                <Label className="text-base" htmlFor="custom-notification-rules">
                  Custom Notification Rules
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary">
                    Pro
                  </span>
                </Label>
                <p className="text-sm text-gray-500">
                  Create custom rules for when and how you receive notifications
                </p>
              </div>
              <Switch
                id="custom-notification-rules"
                checked={false}
                disabled={user?.planType !== "pro"}
                onCheckedChange={() => {}}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Plan</CardTitle>
              <CardDescription>
                Your current plan and benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Current Plan</div>
                  <div className="font-medium capitalize">
                    {user?.planType === "pro" ? (
                      <span className="flex items-center text-green-600">
                        Pro <CheckCircle className="ml-1 h-4 w-4" />
                      </span>
                    ) : (
                      "Free"
                    )}
                  </div>
                </div>
                
                {user?.planType === "free" ? (
                  <>
                    <div className="text-sm text-gray-500 space-y-2">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>3 Forms</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Basic Analytics</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>100 Submissions/month</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <Link href="/subscription">Upgrade to Pro</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-gray-500 space-y-2">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited Forms</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Advanced Analytics</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited Submissions</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Priority Support</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Account deletion requested",
                    description: "Please contact support to complete this process",
                  });
                }}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
