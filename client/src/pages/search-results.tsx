import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProviderCard from "@/components/providers/provider-card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function SearchResults() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  
  // Extract search parameters
  const initialCategory = searchParams.get("category") || "";
  const initialCity = searchParams.get("city") || "";
  
  // State for filters
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating-high");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Fetch providers with filters
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers", { category, city }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (city) params.append("city", city);
      
      const res = await fetch(`/api/providers?${params.toString()}`);
      if (!res.ok) return [];
      return await res.json();
    },
  });
  
  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (city) params.append("city", city);
    
    const newSearch = params.toString();
    if (newSearch !== search.replace(/^\?/, '')) {
      navigate(`/search${newSearch ? `?${newSearch}` : ''}`);
    }
  }, [category, city, navigate]);
  
  // Filter by verified status if needed
  const filteredProviders = isVerifiedOnly 
    ? providers.filter((provider: any) => provider.providerProfile?.isVerified) 
    : providers;
  
  // Sort providers
  const sortedProviders = [...filteredProviders].sort((a: any, b: any) => {
    if (sortBy === "rating-high") {
      // Using simulated ratings for sorting since we don't have real ratings in our data
      return (b.providerProfile?.rating || 0) - (a.providerProfile?.rating || 0);
    } else if (sortBy === "price-low") {
      return (a.providerProfile?.hourlyRate || 0) - (b.providerProfile?.hourlyRate || 0);
    } else if (sortBy === "price-high") {
      return (b.providerProfile?.hourlyRate || 0) - (a.providerProfile?.hourlyRate || 0);
    }
    return 0;
  });
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (city) params.append("city", city);
    
    navigate(`/search?${params.toString()}`);
  };
  
  // Filter component for both desktop and mobile
  const FilterControls = () => (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-neutral-900 mb-3">Category</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="all-categories"
                name="category"
                checked={category === ""}
                onChange={() => setCategory("")}
                className="h-4 w-4 text-primary-600 border-neutral-300 rounded"
              />
              <label htmlFor="all-categories" className="ml-2 text-neutral-700">
                All Categories
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="plumbing"
                name="category"
                checked={category === "plumbing"}
                onChange={() => setCategory("plumbing")}
                className="h-4 w-4 text-primary-600 border-neutral-300 rounded"
              />
              <label htmlFor="plumbing" className="ml-2 text-neutral-700">
                Plumbing
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="electrical"
                name="category"
                checked={category === "electrical"}
                onChange={() => setCategory("electrical")}
                className="h-4 w-4 text-primary-600 border-neutral-300 rounded"
              />
              <label htmlFor="electrical" className="ml-2 text-neutral-700">
                Electrical
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="landscaping"
                name="category"
                checked={category === "landscaping"}
                onChange={() => setCategory("landscaping")}
                className="h-4 w-4 text-primary-600 border-neutral-300 rounded"
              />
              <label htmlFor="landscaping" className="ml-2 text-neutral-700">
                Landscaping
              </label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium text-neutral-900 mb-3">Verification</h3>
          <div className="flex items-center">
            <Checkbox 
              id="verified-only" 
              checked={isVerifiedOnly}
              onCheckedChange={(checked) => setIsVerifiedOnly(checked === true)}
            />
            <label htmlFor="verified-only" className="ml-2 text-neutral-700">
              Verified Providers Only
            </label>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium text-neutral-900 mb-3">Sort By</h3>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-high">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Find Service Providers</h1>
          
          <div className="block md:hidden">
            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-6">Filters</h2>
                  <FilterControls />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <FilterControls />
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="space-y-6">
            {/* Search bar */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label htmlFor="search-city" className="sr-only">City</Label>
                    <Input
                      id="search-city"
                      placeholder="Enter city name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {isLoading ? "Loading results..." : `${sortedProviders.length} result${sortedProviders.length !== 1 ? 's' : ''}`}
                </h2>
                
                <div className="hidden sm:block">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating-high">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : sortedProviders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProviders.map((provider: any) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto mb-4">
                      <Search className="h-12 w-12 text-neutral-300" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No results found</h3>
                    <p className="text-neutral-500">
                      Try adjusting your search or filter criteria to find service providers.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
