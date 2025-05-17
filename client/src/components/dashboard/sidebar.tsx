import React from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/auth-context";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  User, 
  Settings,
  ChevronUp,
  ChevronDown,
  Code
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = React.useState(!isMobile);
  
  // Fetch forms to get correct count
  const { data: forms = [] } = useQuery<any[]>({
    queryKey: ["/api/forms"],
    enabled: !!user && user.planType === "free",
  });

  React.useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  if (isMobile && !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 p-0 shadow-lg"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  interface MenuItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    current: boolean;
    proOnly?: boolean;
  }

  const menu: MenuItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-6 w-6" />,
      current: location === "/dashboard",
    },
    {
      name: "My Forms",
      href: "/forms",
      icon: <FileText className="h-6 w-6" />,
      current: location === "/forms" || location.startsWith("/forms/"),
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <BarChart2 className="h-6 w-6" />,
      current: location === "/analytics",
    },
    {
      name: "API Docs",
      href: "/api-docs",
      icon: <Code className="h-6 w-6" />,
      current: location === "/api-docs",
      proOnly: true,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="h-6 w-6" />,
      current: location === "/profile",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-6 w-6" />,
      current: location === "/settings",
    },
  ];

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div 
        className={`${
          isMobile 
            ? "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out" 
            : "hidden md:block w-64"
        } bg-white border-r border-gray-200 min-h-screen`}
      >
        {isMobile && (
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 bg-white space-y-1">
              {menu.map((item) => {
                // Skip proOnly items if user is not on Pro plan
                if (item.proOnly && user?.planType !== "pro") {
                  return null;
                }
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`${
                        item.current
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <div className={`${
                        item.current ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                      } mr-3 flex-shrink-0`}>
                        {item.icon}
                      </div>
                      {item.name}
                      {item.proOnly && (
                        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-800">
                          Pro
                        </span>
                      )}
                    </a>
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Your Plan
                    </h3>
                    {user?.planType === "free" && (
                      <Link href="/subscription">
                        <a className="text-xs text-primary hover:text-primary-700">
                          Upgrade
                        </a>
                      </Link>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">
                      {user?.planType === "free" ? "Free Plan" : "Pro Plan"}
                    </span>
                    {user?.planType === "free" && (
                      <span className="text-xs text-gray-400 ml-1">({forms.length}/3 forms used)</span>
                    )}
                  </div>
                  {user?.planType === "free" && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.min(forms.length / 3 * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
