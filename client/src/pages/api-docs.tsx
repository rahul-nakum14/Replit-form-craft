import React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Key, Lock } from "lucide-react";
import { useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ApiDocs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [apiKey, setApiKey] = React.useState<string>(""); // In a real app, this would be generated and stored

  React.useEffect(() => {
    if (user) {
      // Generate a fake API key for demo purposes
      // In a real app, this would be fetched from the server
      setApiKey(`fct-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`);
    }
  }, [user]);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: message,
    });
  };

  // If user is not Pro, show upgrade message
  if (user?.planType !== "pro") {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">API Documentation</h1>
          <p className="text-gray-500">Access the FormCraft API</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-primary" />
              Pro Feature
            </CardTitle>
            <CardDescription>
              API Access is available only for Pro plan users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Get API access to integrate FormCraft with your applications. Use our API to:
            </p>
            <ul className="list-disc ml-6 space-y-2 mb-4">
              <li>Create forms programmatically</li>
              <li>Manage form submissions</li>
              <li>Access analytics data</li>
              <li>And much more...</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/subscription")}
            >
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">API Documentation</h1>
        <p className="text-gray-500">Access the FormCraft API</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your API Key</CardTitle>
            <CardDescription>Use this key to authenticate your API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input 
                  type="text" 
                  value={apiKey} 
                  readOnly 
                  className="pr-10 font-mono text-sm"
                />
                <Button 
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => copyToClipboard(apiKey, "API key copied to clipboard")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setApiKey(`fct-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`);
                  toast({
                    title: "API Key Regenerated",
                    description: "Your new API key has been generated. The old key is no longer valid.",
                  });
                }}
              >
                Regenerate
              </Button>
            </div>
            
            <Alert className="mt-4">
              <Key className="h-4 w-4" />
              <AlertTitle>Keep your API key secure</AlertTitle>
              <AlertDescription>
                Your API key provides full access to your FormCraft account. Never share it publicly or in client-side code.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Learn how to use the FormCraft API</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="authentication">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>
              <TabsContent value="authentication" className="p-4 border rounded-md mt-4">
                <h3 className="text-lg font-medium mb-2">Authentication</h3>
                <p className="mb-4">All API requests must include your API key in the headers:</p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                  {`Authorization: Bearer ${apiKey}`}
                </pre>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(`Authorization: Bearer ${apiKey}`, "Header copied to clipboard")}
                  className="mt-2"
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </TabsContent>
              <TabsContent value="forms" className="p-4 border rounded-md mt-4">
                <h3 className="text-lg font-medium mb-2">Forms API</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Get all forms</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      GET /api/forms
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium">Get a specific form</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      GET /api/forms/:id
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium">Create a new form</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      POST /api/forms
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium">Update a form</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      PUT /api/forms/:id
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium">Delete a form</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      DELETE /api/forms/:id
                    </pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="submissions" className="p-4 border rounded-md mt-4">
                <h3 className="text-lg font-medium mb-2">Form Submissions API</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Get submissions for a form</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      GET /api/forms/:formId/submissions
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium">Get a specific submission</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      GET /api/submissions/:id
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium">Submit to a form</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                      POST /api/public/forms/:slug/submit
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-6 block">
            <p className="text-sm text-gray-500 mb-4">
              For full API documentation and examples, refer to our developer guides:
            </p>
            <Button className="w-full">
              View Developer Guides
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}