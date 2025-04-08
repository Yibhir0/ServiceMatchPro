import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useSearchParams } from "../hooks/use-search-params";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin, Star, Briefcase } from "lucide-react";

export default function SearchResults() {
  const [location] = useLocation();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  
  // Local state for filters
  const [filters, setFilters] = useState({
    category: category,
    city: city,
    minRating: "",
    maxPrice: "",
    sortBy: "rating", // 'rating', 'price-low', 'price-high'
  });
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  
  // Query for service providers
  const { data: providers, isLoading } = useQuery({
    queryKey: ["/api/providers/search", query, category, city],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Query for cities (for filter)
  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Query for service categories (for filter)
  const { data: categories } = useQuery({
    queryKey: ["/api/services"],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    window.location.href = `/search?${params.toString()}`;
  };
  
  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Filter and sort providers
  const filteredProviders = providers 
    ? providers
      .filter(provider => 
        (!filters.category || provider.category === filters.category) &&
        (!filters.city || provider.city === filters.city) &&
        (!filters.minRating || provider.rating >= parseFloat(filters.minRating))
      )
      .sort((a, b) => {
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'price-low') return a.hourlyRate - b.hourlyRate;
        if (filters.sortBy === 'price-high') return b.hourlyRate - a.hourlyRate;
        return 0;
      })
    : [];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services or providers"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filters
              </Button>
              
              <Button type="submit" className="flex items-center gap-2">
                <Search size={18} />
                Search
              </Button>
            </div>
          </form>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories?.map(category => (
                    <option key={category.id} value={category.category}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange("minRating", e.target.value)}
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+</option>
                  <option value="4">4+</option>
                  <option value="3.5">3.5+</option>
                  <option value="3">3+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Results for "${query}"` : 'Service Providers'}
            {category ? ` in ${category}` : ''}
            {city ? ` near ${city}` : ''}
          </h1>
          
          <p className="text-gray-600">
            {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-start">
                  <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                  <div className="ml-4 flex-grow">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredProviders.map((provider) => (
              <div key={provider.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start">
                  <div className="md:flex-shrink-0 flex justify-center mb-4 md:mb-0">
                    <div className="h-24 w-24 bg-gray-200 rounded-full overflow-hidden">
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
                  </div>
                  
                  <div className="md:ml-6 flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {provider.firstName} {provider.lastName}
                      </h2>
                      
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="flex items-center text-yellow-500 mr-2">
                          <Star className="h-5 w-5 fill-current" />
                          <span className="ml-1 text-gray-900 font-medium">{provider.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-600 text-sm">({provider.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-gray-600 mb-2">
                        <Briefcase size={18} className="mr-2" />
                        <span className="capitalize">{provider.category}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2" />
                        <span>{provider.city}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{provider.bio}</p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                      <div className="text-lg font-bold text-primary mb-3 sm:mb-0">
                        ${provider.hourlyRate}/hour
                      </div>
                      
                      <Link href={`/providers/${provider.id}`}>
                        <Button className="w-full sm:w-auto">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-7xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any service providers matching your search criteria.
              Try adjusting your filters or search terms.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setFilters({
                  category: "",
                  city: "",
                  minRating: "",
                  maxPrice: "",
                  sortBy: "rating"
                });
                setShowFilters(true);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}