import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function ServiceCategories() {
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  // Group services by category
  const serviceCategories = services.reduce((acc: any, service: any) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  const categoryInfo = {
    plumbing: {
      title: "Plumbing",
      description: "Professional plumbers to fix leaks, install fixtures, and handle all your plumbing needs.",
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1770&q=80",
    },
    electrical: {
      title: "Electrical",
      description: "Licensed electricians for repairs, installations, and electrical system upgrades.",
      imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1769&q=80",
    },
    landscaping: {
      title: "Landscaping",
      description: "Expert landscapers to maintain and beautify your outdoor spaces.",
      imageUrl: "https://images.unsplash.com/photo-1558904541-efa5a29344ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1770&q=80",
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-neutral-900">Our Services</h2>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 mx-auto">
            Whatever your home needs, we've got you covered with qualified professionals.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(categoryInfo).map((category) => (
              <div key={category} className="group">
                <Card className="overflow-hidden group-hover:shadow-md transition-shadow duration-300">
                  <div className="h-48 w-full overflow-hidden">
                    <div 
                      className="w-full h-full bg-neutral-200 group-hover:scale-105 transition-transform duration-300"
                      style={{ 
                        backgroundImage: `url(${categoryInfo[category as keyof typeof categoryInfo].imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-neutral-900">
                      {categoryInfo[category as keyof typeof categoryInfo].title}
                    </h3>
                    <p className="mt-2 text-base text-neutral-500">
                      {categoryInfo[category as keyof typeof categoryInfo].description}
                    </p>
                    <div className="mt-4">
                      <Link href={`/search?category=${category}`}>
                        <a className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                          Find a {category === 'plumbing' ? 'plumber' : 
                                  category === 'electrical' ? 'electrician' : 'landscaper'}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
