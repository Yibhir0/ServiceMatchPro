import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { apiRequest, queryClient } from '../lib/queryClient';
import { formatDate, formatPrice } from '../lib/utils';

export default function ServiceProviderPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // State for booking modal
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledTime: '',
    address: user?.address || '',
    description: '',
    serviceId: '',
  });
  
  // Fetch provider data
  const { data: provider, isLoading } = useQuery({
    queryKey: [`/api/provider/${id}`],
    enabled: Boolean(id),
  });
  
  // Fetch provider services
  const { data: services } = useQuery({
    queryKey: [`/api/provider/${id}/services`],
    enabled: Boolean(id) && Boolean(provider),
  });
  
  // Fetch provider reviews
  const { data: reviews } = useQuery({
    queryKey: [`/api/provider/${id}/reviews`],
    enabled: Boolean(id) && Boolean(provider),
  });
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest('POST', '/api/bookings', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: 'Booking created',
        description: 'Your service has been booked successfully.',
      });
      setShowBookingForm(false);
      navigate('/bookings');
    },
    onError: (error) => {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to book a service.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    createBookingMutation.mutate({
      providerId: parseInt(id),
      ...bookingData,
    });
  };
  
  const handleServiceSelect = (serviceId) => {
    setBookingData((prev) => ({
      ...prev,
      serviceId,
    }));
    setShowBookingForm(true);
    
    // Scroll to booking form
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!provider) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Provider not found</h1>
        <p className="mb-4">The service provider you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/search')}>
          Find Other Providers
        </Button>
      </div>
    );
  }
  
  const selectedService = services?.find(s => s.id === bookingData.serviceId);
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Provider Header */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Provider Image */}
          <div className="w-full md:w-48 h-48 bg-muted rounded-md overflow-hidden flex-shrink-0">
            {provider.profileImage ? (
              <img 
                src={provider.profileImage} 
                alt={provider.businessName || provider.user?.fullName} 
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
                  className="w-20 h-20"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
          </div>
          
          {/* Provider Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {provider.businessName || provider.user?.fullName}
                </h1>
                <p className="text-lg text-muted-foreground capitalize">
                  {provider.category}
                </p>
              </div>
              
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-yellow-500 text-2xl mr-1">★</span>
                <span className="text-xl font-semibold">{provider.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({reviews?.length || 0} reviews)
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center text-sm mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {provider.location}
                </div>
                
                <div className="flex items-center text-sm mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {provider.phoneNumber}
                </div>
                
                <div className="flex items-center text-sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  ${provider.hourlyRate.toFixed(2)}/hour
                </div>
              </div>
              
              <div>
                <div className="flex items-center text-sm mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {provider.completedBookings || 0} jobs completed
                </div>
                
                <div className="flex items-center text-sm mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Member since {new Date(provider.user?.createdAt || Date.now()).toLocaleDateString()}
                </div>
                
                <div className="flex items-center text-sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Verified Provider
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-sm">{provider.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Services</h2>
        
        {!services || services.length === 0 ? (
          <p className="text-muted-foreground">No services listed for this provider.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-md p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">{formatPrice(service.price)}</span>
                  <Button 
                    size="sm"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Booking Form */}
      {showBookingForm && (
        <div id="booking-form" className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Book Service</h2>
          
          {selectedService && (
            <div className="mb-4 p-3 bg-muted/20 rounded-md">
              <h3 className="font-semibold">
                {selectedService.name} - {formatPrice(selectedService.price)}
              </h3>
              <p className="text-sm text-muted-foreground">{selectedService.description}</p>
            </div>
          )}
          
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium mb-1">
                Date and Time
              </label>
              <input
                type="datetime-local"
                id="scheduledTime"
                name="scheduledTime"
                value={bookingData.scheduledTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Service Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={bookingData.address}
                onChange={handleInputChange}
                placeholder="Enter the service location address"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Service Details
              </label>
              <textarea
                id="description"
                name="description"
                value={bookingData.description}
                onChange={handleInputChange}
                placeholder="Describe what you need help with"
                className="w-full p-2 border rounded-md h-24"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowBookingForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                ) : null}
                Confirm Booking
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Reviews Section */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <div className="flex items-center">
            <span className="text-yellow-500 text-xl mr-1">★</span>
            <span className="font-semibold">{provider.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground ml-1">
              ({reviews?.length || 0} reviews)
            </span>
          </div>
        </div>
        
        {!reviews || reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet for this provider.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.customer?.fullName || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}