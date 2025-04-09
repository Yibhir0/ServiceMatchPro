import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';

// Custom hook to parse query parameters
function useSearchParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1] || '');
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const locationParam = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';
  
  const [searchFilters, setSearchFilters] = useState({
    query,
    location: locationParam,
    category,
    minPrice: '',
    maxPrice: '',
    rating: '',
  });
  
  const [, navigate] = useLocation();

  // Fetch search results
  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/providers/search', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add all non-empty filters to the query
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Example API endpoint for searching providers
      const res = await fetch(`/api/providers/search?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      return res.json();
    },
    enabled: Boolean(query || locationParam || category),
  });

  // Update search filters when URL params change
  useEffect(() => {
    setSearchFilters(prev => ({
      ...prev,
      query,
      location: locationParam,
      category,
    }));
  }, [query, locationParam, category]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters({
      ...searchFilters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // Add all non-empty filters to the URL
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    navigate(`/search?${params.toString()}`);
  };

  // Categories for filter
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
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">
        Search Results
        {query && <span> for "{query}"</span>}
        {category && <span> in {category}</span>}
        {locationParam && <span> near {locationParam}</span>}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-background border rounded-lg p-4 sticky top-4">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Service Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full p-2 border rounded-md"
                  value={searchFilters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="City or Zip Code"
                  className="w-full p-2 border rounded-md"
                  value={searchFilters.location}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min $"
                    className="w-full p-2 border rounded-md"
                    value={searchFilters.minPrice}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max $"
                    className="w-full p-2 border rounded-md"
                    value={searchFilters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium mb-1">
                  Minimum Rating
                </label>
                <select
                  id="rating"
                  name="rating"
                  className="w-full p-2 border rounded-md"
                  value={searchFilters.rating}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Star</option>
                </select>
              </div>
              
              <Button 
                onClick={applyFilters}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : !providers || providers.length === 0 ? (
            <div className="bg-background border rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later.
              </p>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results count */}
              <p className="text-sm text-muted-foreground">
                Found {providers.length} service provider{providers.length !== 1 ? 's' : ''}
              </p>
              
              {/* Results list */}
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div 
                    key={provider.id} 
                    className="bg-background border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => navigate(`/provider/${provider.id}`)}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Provider image */}
                      <div className="w-full md:w-40 h-40 mb-4 md:mb-0 md:mr-4 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {provider.profileImage ? (
                          <img 
                            src={provider.profileImage} 
                            alt={provider.businessName || provider.user.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="w-16 h-16"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Provider info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">
                              {provider.businessName || provider.user.fullName}
                            </h3>
                            <p className="text-sm capitalize">{provider.category}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold mr-1">{provider.rating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-2">
                          <p className="text-sm flex items-center text-muted-foreground">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4 mr-1"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {provider.location}
                          </p>
                          
                          <p className="text-sm flex items-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4 mr-1"
                            >
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            ${provider.hourlyRate}/hour
                          </p>
                        </div>
                        
                        <p className="mt-3 text-sm line-clamp-2">{provider.description}</p>
                        
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/provider/${provider.id}`);
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}