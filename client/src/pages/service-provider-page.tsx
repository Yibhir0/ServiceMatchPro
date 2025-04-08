import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Star, 
  CheckCircle, 
  Phone, 
  Mail, 
  Briefcase,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  scheduledDate: z.string().min(1, "Date is required"),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function ServiceProviderPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // Fetch provider data
  const { data: provider, isLoading } = useQuery({
    queryKey: [`/api/providers/${id}`],
    enabled: !!id,
  });

  // Fetch services for the provider's category
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services", provider?.providerProfile?.category],
    queryFn: async () => {
      if (!provider?.providerProfile?.category) return [];
      const res = await fetch(`/api/services?category=${provider.providerProfile.category}`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!provider?.providerProfile?.category,
  });

  // Fetch reviews for this provider
  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/providers/${id}/reviews`],
    enabled: !!id,
  });

  // Setup booking form
  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      scheduledDate: "",
      description: "",
      address: "",
      city: user?.city || "",
    },
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      if (!user) throw new Error("You must be logged in to book a service");
      
      const payload = {
        ...data,
        serviceId: parseInt(data.serviceId),
        providerId: parseInt(id),
        customerId: user.id,
      };
      
      const res = await apiRequest("POST", "/api/bookings", payload);
      return await res.json();
    },
    onSuccess: () => {
      setIsBookingDialogOpen(false);
      toast({
        title: "Booking requested",
        description: "Your booking request has been sent to the provider",
      });
      bookingForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitBooking = (data: BookingFormValues) => {
    bookingMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Provider Not Found</CardTitle>
            <CardDescription>
              The service provider you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/")}>Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { name, email, city, bio, providerProfile } = provider;
  const { hourlyRate, category, isVerified, yearsOfExperience } = providerProfile;

  // Calculate rating from reviews
  const avgRating = reviews.length 
    ? (reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Provider info */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={provider.profileImage} />
                  <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{name}</h1>
                    
                    {isVerified && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-lg text-neutral-500 capitalize mt-1">{category}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                      <span>{city || "No location"}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-neutral-500 mr-2" />
                      <span>${hourlyRate}/hour</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-accent-500 mr-2" />
                      <span>{avgRating} ({reviews.length} reviews)</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-neutral-500 mr-2" />
                      <span>{yearsOfExperience} years experience</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-neutral-600">
                  {bio || "This provider has not added a bio yet."}
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h2 className="text-xl font-bold mb-4">Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service: any) => (
                    <div key={service.id} className="border rounded-md p-4">
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Reviews & Ratings</CardTitle>
              <CardDescription>
                See what others are saying about this service provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {review.customer?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <h4 className="font-medium">{review.customer?.name || "Anonymous"}</h4>
                            <p className="text-sm text-neutral-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-accent-500 fill-accent-500" : "text-neutral-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-neutral-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-500">No reviews yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Contact and Booking */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Contact & Booking</CardTitle>
              <CardDescription>
                Request services or get in touch with the provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-neutral-500 mr-3" />
                <span>{provider.phone || "Phone not provided"}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-neutral-500 mr-3" />
                <span>{email}</span>
              </div>
              
              <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Book a Service with {name}</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to request a service appointment
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...bookingForm}>
                    <form 
                      onSubmit={bookingForm.handleSubmit(onSubmitBooking)} 
                      className="space-y-4 mt-4"
                    >
                      <FormField
                        control={bookingForm.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map((service: any) => (
                                  <SelectItem 
                                    key={service.id} 
                                    value={service.id ? service.id.toString() : "0"}
                                  >
                                    {service.name || "Unknown service"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bookingForm.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>When do you need this service?</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bookingForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bookingForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bookingForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Details about the job</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe what you need help with" 
                                className="resize-none" 
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={bookingMutation.isPending || !user}
                        >
                          {bookingMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Booking Request"
                          )}
                        </Button>
                      </DialogFooter>
                      
                      {!user && (
                        <p className="text-sm text-red-500 mt-2">
                          You must be logged in to book a service.{" "}
                          <a 
                            href="/auth" 
                            className="text-primary-600 hover:underline"
                          >
                            Log in or register
                          </a>
                        </p>
                      )}
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <p className="text-sm text-neutral-500 mt-2">
                <Clock className="h-4 w-4 inline-block mr-1" />
                Usually responds within 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
