import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  initials: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      name: "Lisa M.",
      location: "Homeowner in Boston",
      rating: 5,
      comment: "I needed an emergency plumber for a burst pipe. Found one on HomeHelp within 30 minutes, and they were at my house within the hour. Saved me from a complete disaster!",
      initials: "LM",
    },
    {
      name: "Robert J.",
      location: "Homeowner in Denver",
      rating: 5,
      comment: "The electrician I hired through HomeHelp was professional, punctual, and fixed my wiring issues quickly. The verification system gave me confidence in their qualifications.",
      initials: "RJ",
    },
    {
      name: "Amina K.",
      location: "Homeowner in Seattle",
      rating: 4.5,
      comment: "I've used HomeHelp three times now for different services. Being able to see verified reviews and credentials makes finding trustworthy professionals so much easier.",
      initials: "AK",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const filled = i < Math.floor(rating);
      const halfFilled = !filled && i < Math.ceil(rating) && rating % 1 !== 0;
      
      return (
        <Star
          key={i}
          className={`h-4 w-4 ${
            filled ? "text-accent-500 fill-accent-500" : 
            halfFilled ? "text-accent-500 fill-accent-500" : "text-neutral-300"
          }`}
        />
      );
    });
  };

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-neutral-900">What Our Customers Say</h2>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 mx-auto">
            Read about real experiences from customers who found quality service providers on our platform.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex text-accent-500 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-neutral-600 italic mb-4">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-neutral-200 text-neutral-600">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-neutral-900">{testimonial.name}</h4>
                      <p className="text-sm text-neutral-500">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
