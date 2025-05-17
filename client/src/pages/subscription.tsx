import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ArrowLeft, CreditCard, Sparkles, Zap } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.planType === "pro") {
      toast({
        title: "Already subscribed",
        description: "You are already on the Pro plan",
      });
      setLocation("/dashboard");
    }
  }, [user, toast, setLocation]);

  const features = [
    { name: "Unlimited forms", free: false, pro: true },
    { name: "Advanced analytics", free: false, pro: true },
    { name: "Unlimited submissions", free: false, pro: true },
    { name: "Advanced form fields", free: false, pro: true },
    { name: "Email notifications", free: false, pro: true },
    { name: "Form expiration settings", free: false, pro: true },
    { name: "Priority support", free: false, pro: true },
    { name: "Custom themes", free: false, pro: true },
    { name: "API access", free: false, pro: true },
  ];

  const handleUpgradeClick = () => {
    setLocation("/checkout");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Upgrade to Pro</h1>
        <p className="text-gray-500">Unlock all features to get the most out of FormCraft</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="mb-6 border-primary/50 shadow-sm">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="flex justify-between items-center">
                <span>Pro Plan</span>
                <span className="text-2xl font-bold">$15</span>
              </CardTitle>
              <CardDescription className="text-primary-foreground opacity-90">
                Per month, billed monthly
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Your current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>3 custom forms</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basic analytics</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>100 form submissions/month</span>
                </div>
                {features.slice(0, 6).map((feature, i) => (
                  !feature.free && (
                    <div key={i} className="flex items-center text-gray-400">
                      <X className="h-5 w-5 text-red-400 mr-2" />
                      <span>{feature.name}</span>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Now</CardTitle>
              <CardDescription>
                Get unlimited access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center mb-2">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    Pro Plan Benefits
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Create unlimited forms</span>
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Advanced analytics and metrics</span>
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Premium form templates</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-b py-4 my-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Monthly subscription</span>
                    <span className="font-medium">$15.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Billed monthly</span>
                    <span>Cancel anytime</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleUpgradeClick}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex flex-col space-y-4">
              <div className="text-sm text-gray-500 space-y-2">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-6">
            <div className="text-sm text-gray-500">
              <h4 className="font-medium text-gray-900 mb-2">Need help?</h4>
              <p className="mb-4">
                If you have any questions about our pricing or plans, please don't hesitate to contact us.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  window.location.href = "mailto:support@formcraft.example.com?subject=FormCraft%20Support%20Request&body=I%20have%20a%20question%20about%20FormCraft%20plans%20and%20pricing.";
                  toast({
                    title: "Support Email Ready",
                    description: "Your email client has been opened with our support address",
                  });
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
