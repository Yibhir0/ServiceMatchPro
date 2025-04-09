import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Star, MapPin, Briefcase, Clock, Award, Calendar, DollarSign, 
  Phone, Mail, Shield, Check, AlertCircle, Calendar as CalendarIcon 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function ServiceProviderPage() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    serviceId: "",
    scheduledDate: "",
    description: "",
    address: "",
    city: "",
  });
  
  // Fetch provider details
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: [`/api/providers/${id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch provider reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/providers/${id}/reviews`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch provider credentials
  const { data: credentials, isLoading: credentialsLoading } = useQuery({
    queryKey: [`/api/providers/${id}/credentials`],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  // Fetch services for this provider's category
  const { data: services } = useQuery({
    queryKey: ["/api/services", provider?.category],
    enabled: !!provider?.category,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["/api/bookings"]);
      toast({
        title: "Booking Created",
        description: "Your service has been booked successfully!",
        variant: "default",
      });
      setBookingModalOpen(false);
      setLocation("/bookings");
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a service.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    // Validate form
    if (!bookingForm.serviceId || !bookingForm.scheduledDate || !bookingForm.description || !bookingForm.address || !bookingForm.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createBookingMutation.mutate({
      ...bookingForm,
      providerId: Number(id),
    });
  };
  
  const updateBookingField = (field, value) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Show loading state if data is not ready
  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Show not found if provider doesn't exist
  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
            <p className="text-gray-600 mb-6">The service provider you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/search")}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Provider Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary to-blue-700 h-48 relative"></div>
          
          <div className="p-6 md:p-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row">
              <div className="mx-auto md:mx-0 mb-4 md:mb-0">
                <div className="h-32 w-32 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {provider.profileImage ? (
                    <img 
                      src={provider.profileImage} 
                      alt={`${provider.firstName} ${provider.lastName}`}
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl uppercase">
                      {provider.firstName?.charAt(0) || ''}{provider.lastName?.charAt(0) || ''}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:ml-6 text-center md:text-left flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {provider.firstName} {provider.lastName}
                    </h1>
                    
                    <div className="flex flex-col md:flex-row md:items-center mt-2 mb-4">
                      <div className="flex items-center justify-center md:justify-start text-yellow-500 mb-2 md:mb-0 md:mr-4">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 text-gray-900 font-medium">{provider.rating.toFixed(1)}</span>
                        <span className="ml-1 text-gray-600">({reviews?.length || 0} reviews)</span>
                      </div>
                      
                      <div className="flex items-center justify-center md:justify-start text-gray-600">
                        <Clock className="h-5 w-5 mr-1" />
                        <span>{provider.yearsOfExperience} years experience</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center mb-4">
                      <div className="flex items-center text-gray-600 mb-2 md:mb-0 md:mr-4">
                        <Briefcase className="h-5 w-5 mr-1" />
                        <span className="capitalize">{provider.category}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-1" />
                        <span>{provider.city}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className="text-2xl font-bold text-primary mb-2 text-center">
                      ${provider.hourlyRate}/hour
                    </div>
                    
                    <Button 
                      onClick={() => setBookingModalOpen(true)} 
                      className="w-full md:w-auto"
                      disabled={user?.id === provider.userId}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {provider.isVerified && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Verified
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Two Thirds */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{provider.bio}</p>
            </div>
            
            {/* Work Images */}
            {provider.workImages && provider.workImages.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Work Samples</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {provider.workImages.map((image, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Work sample ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
              
              {reviewsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-3">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start">
                        <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                          {review.customerImage ? (
                            <img 
                              src={review.customerImage} 
                              alt={review.customerName}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-300 font-bold text-sm uppercase">
                              {review.customerName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-3 flex-grow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                              <p className="text-gray-500 text-sm">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar - Right Third */}
          <div className="space-y-8">
            {/* Credentials */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Credentials</h2>
              
              {credentialsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="mb-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : credentials && credentials.length > 0 ? (
                <div className="space-y-4">
                  {credentials.map(credential => (
                    <div key={credential.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center mb-1">
                        <Award className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium text-gray-900 capitalize">{credential.type.replace('_', ' ')}</h3>
                      </div>
                      <p className="text-gray-700 mb-1">{credential.description}</p>
                      <p className="text-sm text-gray-500">Issued by: {credential.issuedBy}</p>
                      
                      {credential.isVerified ? (
                        <div className="flex items-center mt-2 text-green-600 text-sm">
                          <Check className="h-4 w-4 mr-1" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center mt-2 text-yellow-600 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Verification pending
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No credentials listed.</p>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                {provider.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-3" />
                    <span className="text-gray-700">{provider.phone}</span>
                  </div>
                )}
                
                {provider.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary mr-3" />
                    <span className="text-gray-700">{provider.email}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Services Offered */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
              
              {services ? (
                <div className="space-y-3">
                  {services
                    .filter(service => service.category === provider.category)
                    .map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                        <span className="font-medium text-gray-800">{service.name}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setBookingForm(prev => ({ ...prev, serviceId: service.id }));
                            setBookingModalOpen(true);
                          }}
                          disabled={user?.id === provider.userId}
                        >
                          Book
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Loading services...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Book a Service</h3>
              <button 
                onClick={() => setBookingModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                    value={bookingForm.serviceId}
                    onChange={(e) => updateBookingField("serviceId", e.target.value)}
                    required
                  >
                    <option value="">Select a service</option>
                    {services && services
                      .filter(service => service.category === provider.category)
                      .map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                      value={bookingForm.scheduledDate}
                      onChange={(e) => updateBookingField("scheduledDate", e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your address"
                    value={bookingForm.address}
                    onChange={(e) => updateBookingField("address", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your city"
                    value={bookingForm.city}
                    onChange={(e) => updateBookingField("city", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                    placeholder="Describe what you need help with"
                    rows="4"
                    value={bookingForm.description}
                    onChange={(e) => updateBookingField("description", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Service Rate:</span>
                  <span className="text-gray-900 font-medium">${provider.hourlyRate}/hour</span>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Appointment
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}