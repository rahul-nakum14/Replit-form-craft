import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Play, ChevronRight, Star, ShieldCheck, Users } from "lucide-react";

interface HeroProps {
  onShowSignup: () => void;
}

export function Hero({ onShowSignup }: HeroProps) {
  const { user } = useAuth();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {/* Decorative elements */}
      <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full">
        <div className="relative h-full max-w-7xl mx-auto">
          <svg
            className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
          </svg>
          <svg
            className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
          </svg>
        </div>
      </div>

      <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-24 lg:pt-32 lg:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              {/* Social proof badges */}
              <div className="flex flex-wrap items-center gap-3 mb-8 text-sm text-gray-500 lg:justify-start justify-center">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <span className="ml-2">5.0/5 from 2,000+ reviews</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <div className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-green-500 mr-1" />
                  <span>Secure & Compliant</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-500 mr-1" />
                  <span>100,000+ users</span>
                </div>
              </div>

              <h1>
                <span className="block text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 tracking-wide uppercase">
                  Introducing FormCraft
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Create Dynamic Forms</span>
                  <span className="block text-gray-900">in Minutes, Not Hours</span>
                </span>
              </h1>
              
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Build beautiful, customizable forms with our intuitive drag-and-drop builder. Collect data, analyze responses, and embed forms on your website with no coding required.
              </p>
              
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {user ? (
                      <Button size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                        <a href="/dashboard" className="flex items-center">
                          Go to Dashboard
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </a>
                      </Button>
                    ) : (
                      <Button onClick={onShowSignup} size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                        Get Started - Free
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => setIsVideoOpen(true)}
                      className="w-full border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <Play className="w-4 h-4 mr-2 text-indigo-600" /> Watch Demo
                    </Button>
                  </div>
                </div>
                
                {/* Pricing preview */}
                <p className="mt-3 text-sm text-gray-500">
                  Free plan available or <span className="font-medium text-indigo-600">$15/month</span> for unlimited forms
                </p>
              </div>
            </div>
            
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md overflow-hidden group">
                {/* Gradient overlay for image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 group-hover:opacity-0 transition-opacity duration-300"></div>
                
                {/* Main image */}
                <img 
                  className="w-full rounded-lg transition-all duration-300 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1596720426673-e4e14290f0cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Form builder interface preview"
                />
                
                {/* Play button overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <div className="bg-white/90 rounded-full p-4 shadow-lg transform transition-transform duration-300 hover:scale-110">
                    <Play className="w-8 h-8 text-indigo-600" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-16">
            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full">
              <path fill="#ffffff" fillOpacity="1" d="M0,64L40,64C80,64,160,64,240,90.7C320,117,400,171,480,165.3C560,160,640,96,720,74.7C800,53,880,75,960,96C1040,117,1120,139,1200,133.3C1280,128,1360,96,1400,80L1440,64L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Video demo dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">See FormCraft in action</DialogTitle>
            <DialogDescription className="text-base sm:text-lg">
              Watch how easy it is to create, customize, and publish forms with FormCraft.
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video overflow-hidden rounded-lg border bg-black">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=J5OHiLfBPeAdIFUF"
              title="FormCraft Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
            <p className="text-sm text-gray-500">
              See how to build a complete form in less than 2 minutes
            </p>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button 
                onClick={onShowSignup}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Try it yourself
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}