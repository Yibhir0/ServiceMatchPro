import { Link } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function ProviderPromotion() {
  const { user } = useAuth();
  
  const benefits = [
    "Verified profile with customer reviews",
    "Flexible scheduling and job management",
    "Secure payment processing",
    "Marketing and lead generation",
    "Credential verification for trust building",
  ];

  return (
    <section className="py-12 bg-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div>
            <h2 className="text-3xl font-extrabold">Are you a service professional?</h2>
            <p className="mt-4 text-lg">
              Join our network of verified providers and grow your business with a steady stream of new customers. We handle the marketing and booking logistics so you can focus on what you do best.
            </p>
            <div className="mt-8">
              {!user ? (
                <Link href="/auth">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-primary-700 bg-white hover:bg-neutral-50"
                  >
                    Join as a Provider
                  </Button>
                </Link>
              ) : user.role === "provider" ? (
                <Link href="/profile">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-primary-700 bg-white hover:bg-neutral-50"
                  >
                    Manage Your Provider Profile
                  </Button>
                </Link>
              ) : (
                <Link href="/profile">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-primary-700 bg-white hover:bg-neutral-50"
                  >
                    Convert to Provider Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="mt-10 lg:mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6 text-neutral-800">
              <h3 className="text-xl font-bold mb-4">Provider Benefits</h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex">
                    <CheckCircle className="text-secondary-500 h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
