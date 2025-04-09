import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search query string
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (searchLocation) params.append('location', searchLocation);
    if (searchCategory) params.append('category', searchCategory);
    
    setLocation(`/search?${params.toString()}`);
  };

  const serviceCategories = [
    'Plumbing', 
    'Electrical', 
    'Cleaning', 
    'Home Renovation', 
    'Landscaping',
    'Appliance Repair',
    'HVAC',
    'Painting',
    'Moving Services',
    'Pest Control'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/90 to-primary/70 text-white py-16 px-4 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Trusted Home Service Professionals
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-white/90">
              Connect with verified experts for your home service needs - from plumbing and electrical to cleaning and landscaping.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
                  What service do you need?
                </label>
                <input
                  type="text"
                  id="searchQuery"
                  placeholder="e.g. leaky faucet, lawn care"
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="searchLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="searchLocation"
                  placeholder="Enter your city"
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-gray-900"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="searchCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="searchCategory"
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-gray-900"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {serviceCategories.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button type="submit" className="w-full h-12">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Service Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {serviceCategories.slice(0, 5).map((category) => (
              <div
                key={category}
                className="bg-card hover:bg-accent transition-colors cursor-pointer text-center p-6 rounded-lg shadow-sm border"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.append('category', category.toLowerCase());
                  setLocation(`/search?${params.toString()}`);
                }}
              >
                <h3 className="font-medium text-lg">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Search Services</h3>
              <p className="text-muted-foreground">Find the right service professional for your needs by searching our marketplace.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Book an Appointment</h3>
              <p className="text-muted-foreground">Schedule a service with your chosen professional at a time that works for you.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Get Work Done</h3>
              <p className="text-muted-foreground">Receive quality service from verified professionals and pay securely through our platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find a service provider?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found reliable service professionals through our platform.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation('/auth')}
                size="lg"
                className="px-8"
              >
                Sign Up Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setLocation('/search');
                }}
                size="lg"
                className="px-8"
              >
                Browse Services
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setLocation('/search')}
              size="lg"
              className="px-8"
            >
              Find Services
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}