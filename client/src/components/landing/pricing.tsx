import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import { Check, X } from "lucide-react";

interface PricingProps {
  onShowSignup: () => void;
}

export function Pricing({ onShowSignup }: PricingProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleUpgradeClick = () => {
    if (user) {
      setLocation("/subscription");
    } else {
      onShowSignup();
    }
  };

  return (
    <div id="pricing" className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Choose the right plan for you
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Start with our free tier or upgrade for unlimited access and premium features.
          </p>
        </div>

        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Free</h2>
              <p className="mt-4 text-sm text-gray-500">Perfect for individuals and small projects.</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              {user ? (
                <Button className="mt-8 w-full" variant="secondary">
                  Current Plan
                </Button>
              ) : (
                <Button onClick={onShowSignup} className="mt-8 w-full" variant="secondary">
                  Sign up for free
                </Button>
              )}
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">3 custom forms</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Basic analytics</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">100 form submissions/month</span>
                </li>
                <li className="flex space-x-3 opacity-50">
                  <X className="flex-shrink-0 h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-500">Advanced form fields</span>
                </li>
                <li className="flex space-x-3 opacity-50">
                  <X className="flex-shrink-0 h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-500">Email notifications</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border border-primary rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6 bg-primary rounded-t-lg">
              <h2 className="text-lg leading-6 font-medium text-white">Pro</h2>
              <p className="mt-4 text-sm text-primary-foreground opacity-90">For professionals and businesses with advanced needs.</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-white">$15</span>
                <span className="text-base font-medium text-primary-foreground opacity-75">/mo</span>
              </p>
              <Button
                onClick={handleUpgradeClick}
                className="mt-8 w-full"
                variant="secondary"
              >
                Upgrade to Pro
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Unlimited forms</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Advanced analytics</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Unlimited submissions</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Advanced form fields</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Email notifications</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Form expiration settings</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
