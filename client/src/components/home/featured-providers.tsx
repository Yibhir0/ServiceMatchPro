import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProviderCard from "@/components/providers/provider-card";
import { Loader2 } from "lucide-react";

export default function FeaturedProviders() {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers"],
    // We're just going to fetch all providers and show the first few
    // In a real app, there would likely be an endpoint for featured providers
  });

  // For featured providers, we'll just use the first 3 from our data
  const featuredProviders = providers.slice(0, 3);

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-neutral-900">Featured Service Providers</h2>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 mx-auto">
            Our top-rated professionals with verified credentials and excellent reviews.
          </p>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : featuredProviders.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">No featured providers available yet.</p>
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Link href="/search">
              <Button size="lg">
                Browse All Providers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
