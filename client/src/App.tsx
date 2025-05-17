import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Forms from "@/pages/forms";
import FormEdit from "@/pages/form-edit";
import Analytics from "@/pages/analytics";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Subscription from "@/pages/subscription";
import Checkout from "@/pages/checkout";
import SubscriptionSuccess from "@/pages/subscription-success";
import ApiDocs from "@/pages/api-docs";
import PublicForm from "@/pages/public-form";
import { AuthProvider } from "@/context/auth-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/forms" component={Forms} />
      <Route path="/forms/:id" component={FormEdit} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/analytics/:id" component={Analytics} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/f/:slug" component={PublicForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
