import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Home, Zap, Leaf, Star, Shield, CheckCircle } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch service categories
  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch featured providers
  const { data: featuredProviders } = useQuery({
    queryKey: ["/api/providers/featured"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // Service category icons
  const categoryIcons = {
    plumbing: <Home className="h-8 w-8 mb-4 text-blue-500" />,
    electrical: <Zap className="h-8 w-8 mb-4 text-yellow-500" />,
    landscaping: <Leaf className="h-8 w-8 mb-4 text-green-500" />
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Home. Our Expertise.
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with reliable plumbers, electricians, and landscapers in your area.
              Book services with confidence.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row">
                <div className="relative flex-grow mb-2 sm:mb-0 sm:mr-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    className="w-full pl-10 h-12 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-medium">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Wave effect at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L80,112C160,128,320,160,480,160C640,160,800,128,960,122.7C1120,117,1280,139,1360,149.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We offer a wide range of professional home services to meet all your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services ? (
              services.map((service) => (
                <Link key={service.id} href={`/search?category=${service.category}`}>
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                    <div className="p-6 flex flex-col items-center text-center flex-grow">
                      {categoryIcons[service.category]}
                      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <Button
                        variant="ghost"
                        className="mt-auto text-primary hover:bg-primary/10"
                      >
                        Find {service.name}
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Loading state or fallback
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                  <div className="p-6 flex flex-col items-center text-center h-full">
                    <div className="rounded-full bg-gray-200 h-16 w-16 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="mt-auto h-10 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              HomeHelp makes finding and booking quality home services simple and secure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="rounded-full bg-blue-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Providers</h3>
              <p className="text-gray-600">
                All service providers are thoroughly vetted and background-checked
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rated & Reviewed</h3>
              <p className="text-gray-600">
                Read real reviews from customers to help you choose the right professional
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="rounded-full bg-purple-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Satisfaction Guaranteed</h3>
              <p className="text-gray-600">
                We ensure the quality of work or we'll help make it right
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Service Providers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Are You a Service Provider?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our platform to expand your client base and grow your business. 
                HomeHelp connects you with customers looking for quality services in your area.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Expand Your Client Base</p>
                    <p className="text-gray-600">Connect with new customers looking for your services</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Simple Booking System</p>
                    <p className="text-gray-600">Manage appointments and client communications in one place</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Grow Your Business</p>
                    <p className="text-gray-600">Build your reputation with verified reviews from satisfied customers</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/auth">
                  <Button className="px-8">
                    Register as a Provider
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:pl-10">
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">1</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Create Your Profile</h3>
                      <p className="text-gray-600">Sign up and showcase your expertise and services</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">2</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Get Verified</h3>
                      <p className="text-gray-600">Submit your credentials for verification to earn customer trust</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">3</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Accept Bookings</h3>
                      <p className="text-gray-600">Receive booking requests and manage your schedule</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">4</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Get Paid</h3>
                      <p className="text-gray-600">Receive secure payments when jobs are completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      {featuredProviders && featuredProviders.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Featured Providers</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Meet some of our top-rated home service professionals
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProviders.map(provider => (
                <Link key={provider.id} href={`/providers/${provider.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mr-4">
                          {provider.profileImage ? (
                            <img 
                              src={provider.profileImage} 
                              alt={`${provider.firstName} ${provider.lastName}`}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl uppercase">
                              {provider.firstName?.charAt(0) || ''}{provider.lastName?.charAt(0) || ''}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {provider.firstName} {provider.lastName}
                          </h3>
                          <p className="text-gray-600 capitalize">{provider.category}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-gray-700">{provider.rating.toFixed(1)}</span>
                            <span className="ml-1 text-gray-500">({provider.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-2 mb-4">{provider.bio}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-semibold">${provider.hourlyRate}/hr</span>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied homeowners who trust HomeHelp for their service needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/search">
              <Button className="bg-white text-primary hover:bg-gray-100 px-8">
                Find Services
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}