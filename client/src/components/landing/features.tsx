import React from "react";

export function Features() {
  const features = [
    {
      icon: "ri-drag-drop-fill",
      gradient: "from-indigo-500 to-purple-600",
      title: "Drag & Drop Builder",
      description: "Intuitive drag-and-drop interface to build forms without coding. Add text fields, dropdowns, checkboxes, and more with a simple click and drag."
    },
    {
      icon: "ri-eye-fill",
      gradient: "from-blue-500 to-cyan-500",
      title: "Live Preview",
      description: "See your form as you build it with real-time preview to ensure it looks exactly how you want. Make changes and watch them update instantly."
    },
    {
      icon: "ri-code-box-fill",
      gradient: "from-green-500 to-emerald-600",
      title: "Embed Anywhere",
      description: "Embed your forms on any website with a simple iframe or JavaScript snippet. Works seamlessly with WordPress, Shopify, Wix, and custom sites."
    },
    {
      icon: "ri-bar-chart-box-fill",
      gradient: "from-orange-500 to-amber-600",
      title: "Analytics Dashboard",
      description: "Track form performance with detailed analytics. See submission rates, completion times, abandonment points, and demographic information all in one place."
    },
    {
      icon: "ri-palette-fill",
      gradient: "from-pink-500 to-rose-600",
      title: "Beautiful Themes",
      description: "Choose from a variety of professionally designed themes or create your own custom theme with our easy-to-use theme editor."
    },
    {
      icon: "ri-shield-check-fill",
      gradient: "from-teal-500 to-emerald-600",
      title: "Secure & Compliant",
      description: "Your form data is secure with end-to-end encryption and GDPR-compliant data handling. We prioritize your privacy and data security."
    }
  ];

  return (
    <div id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base font-semibold tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Powerful Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to build powerful forms
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Create, customize, and analyze forms with our easy-to-use platform that grows with your business.
          </p>
        </div>

        <div className="mt-12">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 md:gap-y-12">
            {features.map((feature, index) => (
              <div key={index} className="relative group p-6 border border-gray-100 rounded-lg transition-all duration-300 hover:shadow-lg hover:border-gray-200">
                <dt>
                  <div className={`absolute flex items-center justify-center h-14 w-14 rounded-lg bg-gradient-to-r ${feature.gradient} text-white shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${feature.icon} text-2xl`}></i>
                  </div>
                  <p className="ml-20 text-lg leading-6 font-bold text-gray-900">
                    {feature.title}
                  </p>
                </dt>
                <dd className="mt-3 ml-20 text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
