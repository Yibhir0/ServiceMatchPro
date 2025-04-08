import { Search, Calendar, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Search for Services",
      description: "Browse our directory of professional service providers or search for specific skills and availability.",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book an Appointment",
      description: "Select a date and time that works for you and request service from your chosen provider.",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Get the Job Done",
      description: "Your provider completes the work, you approve it, and payment is processed securely through our platform.",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-neutral-900">How HomeHelp Works</h2>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 mx-auto">
            Our simple process connects you with trusted professionals in just a few steps.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  {step.icon}
                </div>
                <h3 className="mt-6 text-lg font-medium text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-base text-neutral-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
