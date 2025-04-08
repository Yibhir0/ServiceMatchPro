import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2, 
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Star
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Review schema
const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Please provide feedback (min 10 characters)"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let color;
  let icon;
  
  switch (status) {
    case "requested":
      color = "bg-blue-100 text-blue-800 border-blue-200";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "accepted":
      color = "bg-yellow-100 text-yellow-800 border-yellow-200";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "completed":
      color = "bg-green-100 text-green-800 border-green-200";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "approved":
      color = "bg-green-100 text-green-800 border-green-200";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "rejected":
      color = "bg-red-100 text-red-800 border-red-200";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    case "cancelled":
      color = "bg-neutral-100 text-neutral-800 border-neutral-200";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    default:
      color = "bg-neutral-100 text-neutral-800 border-neutral-200";
      icon = <AlertCircle className="h-3 w-3 mr-1" />;
  }
  
  return (
    <Badge variant="outline" className={color}>
      {icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });
  
  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking updated",
        description: "The booking status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, amount }: { bookingId: number, amount: number }) => {
      const res = await apiRequest("POST", "/api/payments", { bookingId, amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsPaymentDialogOpen(false);
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment }: { bookingId: number, rating: number, comment: string }) => {
      const res = await apiRequest("POST", "/api/reviews", { bookingId, rating, comment });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsReviewDialogOpen(false);
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Review form setup
  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });
  
  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking: any) => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });
  
  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateBookingStatusMutation.mutate({ id, status });
  };
  
  // Handle payment
  const handlePayment = (booking: any) => {
    const amount = booking.provider?.providerProfile?.hourlyRate || 50; // Default fallback
    createPaymentMutation.mutate({ bookingId: booking.id, amount });
  };
  
  // Handle review submission
  const onReviewSubmit = (data: ReviewFormValues) => {
    if (!selectedBooking) return;
    
    createReviewMutation.mutate({
      bookingId: selectedBooking.id,
      rating: data.rating,
      comment: data.comment,
    });
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
            <CardDescription>
              You need to be logged in to view your bookings.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">
        {user.role === "customer" ? "My Bookings" : "My Jobs"}
      </h1>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((booking: any) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {booking.service?.name || "Service Request"}
                        </CardTitle>
                        <CardDescription>
                          Booking #{booking.id} - {format(new Date(booking.scheduledDate), "PPP 'at' p")}
                        </CardDescription>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">
                          {user.role === "customer" ? "Service Provider" : "Customer"}
                        </h3>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={
                              user.role === "customer" 
                                ? booking.provider?.profileImage 
                                : booking.customer?.profileImage
                            } />
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {user.role === "customer" 
                                ? booking.provider?.name?.charAt(0) 
                                : booking.customer?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="font-medium">
                              {user.role === "customer" 
                                ? booking.provider?.name 
                                : booking.customer?.name}
                            </p>
                            {user.role === "provider" && (
                              <p className="text-sm text-neutral-500">
                                {booking.customer?.phone || "No phone provided"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Service Details</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-neutral-600">
                            <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                            {format(new Date(booking.scheduledDate), "PPP")}
                          </div>
                          <div className="flex items-center text-sm text-neutral-600">
                            <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                            {format(new Date(booking.scheduledDate), "p")}
                          </div>
                          <div className="flex items-start text-sm text-neutral-600">
                            <MapPin className="h-4 w-4 mr-2 mt-1 text-neutral-500" />
                            <div>
                              <p>{booking.address}</p>
                              <p>{booking.city}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-medium mb-2">Job Description</h3>
                      <p className="text-neutral-600">
                        {booking.description}
                      </p>
                    </div>
                    
                    {/* Payment information if available */}
                    {booking.payment && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="font-medium mb-2">Payment</h3>
                        <div className="bg-neutral-50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-600">Amount</span>
                            <span className="font-medium">${booking.payment.amount}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-neutral-600">Status</span>
                            <span className={`font-medium ${
                              booking.payment.status === "completed" 
                                ? "text-green-600" 
                                : "text-yellow-600"
                            }`}>
                              {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Review if available */}
                    {booking.review && user.role === "customer" && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="font-medium mb-2">Your Review</h3>
                        <div className="bg-neutral-50 p-3 rounded-md">
                          <div className="flex items-center mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-4 w-4 ${
                                  i < booking.review.rating 
                                    ? "text-yellow-500 fill-yellow-500" 
                                    : "text-neutral-300"
                                }`} 
                              />
                            ))}
                          </div>
                          <p className="text-neutral-600 italic">
                            "{booking.review.comment}"
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="bg-neutral-50 border-t">
                    <div className="w-full flex flex-wrap gap-3 justify-end">
                      {/* Provider actions */}
                      {user.role === "provider" && (
                        <>
                          {booking.status === "requested" && (
                            <>
                              <Button
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleStatusChange(booking.id, "rejected")}
                                disabled={updateBookingStatusMutation.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(booking.id, "accepted")}
                                disabled={updateBookingStatusMutation.isPending}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                          
                          {booking.status === "accepted" && (
                            <Button
                              onClick={() => handleStatusChange(booking.id, "completed")}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              Mark as Completed
                            </Button>
                          )}
                        </>
                      )}
                      
                      {/* Customer actions */}
                      {user.role === "customer" && (
                        <>
                          {booking.status === "requested" && (
                            <Button
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(booking.id, "cancelled")}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              Cancel
                            </Button>
                          )}
                          
                          {booking.status === "completed" && !booking.payment && (
                            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                              <DialogTrigger asChild>
                                <Button>
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Pay & Approve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Complete Payment</DialogTitle>
                                  <DialogDescription>
                                    Confirm and process payment for this service
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="py-4">
                                  <div className="mb-4 space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-neutral-600">Service</span>
                                      <span className="font-medium">
                                        {booking.service?.name || "Service"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-neutral-600">Provider</span>
                                      <span className="font-medium">{booking.provider?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-neutral-600">Amount</span>
                                      <span className="font-medium">
                                        ${booking.provider?.providerProfile?.hourlyRate || 50}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-yellow-800 text-sm mb-4">
                                    <p>This is a simulated payment for demonstration purposes. No actual payment will be processed.</p>
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsPaymentDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handlePayment(booking)}
                                    disabled={createPaymentMutation.isPending}
                                  >
                                    {createPaymentMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      "Confirm Payment"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {booking.status === "approved" && !booking.review && (
                            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Leave Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Leave a Review</DialogTitle>
                                  <DialogDescription>
                                    Share your experience with {booking.provider?.name}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <Form {...reviewForm}>
                                  <form
                                    onSubmit={reviewForm.handleSubmit(onReviewSubmit)}
                                    className="space-y-4 py-4"
                                  >
                                    <FormField
                                      control={reviewForm.control}
                                      name="rating"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Rating</FormLabel>
                                          <FormControl>
                                            <div className="flex items-center space-x-1">
                                              {[1, 2, 3, 4, 5].map((value) => (
                                                <button
                                                  key={value}
                                                  type="button"
                                                  onClick={() => field.onChange(value)}
                                                  className="focus:outline-none"
                                                >
                                                  <Star
                                                    className={`h-6 w-6 ${
                                                      value <= field.value
                                                        ? "text-yellow-500 fill-yellow-500"
                                                        : "text-neutral-300"
                                                    }`}
                                                  />
                                                </button>
                                              ))}
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={reviewForm.control}
                                      name="comment"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Comment</FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder="Share your experience with this service provider"
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
                                        disabled={createReviewMutation.isPending}
                                      >
                                        {createReviewMutation.isPending ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                          </>
                                        ) : (
                                          "Submit Review"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <div className="py-8 max-w-md mx-auto">
                <div className="mx-auto rounded-full bg-primary-50 p-3 w-12 h-12 mb-4 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No {activeTab !== "all" ? activeTab : ""} bookings found
                </h3>
                <p className="text-neutral-500 mb-6">
                  {user.role === "customer" 
                    ? "When you book a service, your bookings will appear here" 
                    : "When customers book your services, the jobs will appear here"}
                </p>
                
                {user.role === "customer" && (
                  <Button asChild>
                    <a href="/search">Find Services</a>
                  </Button>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
