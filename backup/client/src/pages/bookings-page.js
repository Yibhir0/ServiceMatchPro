import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, MapPin, CheckCircle, XCircle, User, AlignLeft,
  DollarSign, CreditCard, Loader2, Check, ArrowRight 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming", "completed", "all"
  const [viewMode, setViewMode] = useState(user?.role === "provider" ? "received" : "made"); // "made", "received"
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  
  // Determine which API endpoint to use based on user role and view mode
  const getBookingsEndpoint = () => {
    if (!user) return null;
    
    if (viewMode === "made") {
      return `/api/bookings/customer/${user.id}`;
    } else {
      return `/api/bookings/provider/${user.id}`;
    }
  };
  
  // Fetch bookings
  const { 
    data: bookings, 
    isLoading: bookingsLoading,
    refetch: refetchBookings
  } = useQuery({
    queryKey: [getBookingsEndpoint()],
    enabled: !!getBookingsEndpoint(),
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([getBookingsEndpoint()]);
      toast({
        title: "Status Updated",
        description: "The booking status has been updated successfully.",
        variant: "default",
      });
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      const res = await apiRequest("POST", "/api/payments", paymentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([getBookingsEndpoint()]);
      queryClient.invalidateQueries(["/api/payments"]);
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
        variant: "default",
      });
      setPaymentModalOpen(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter bookings based on the active tab
  const filteredBookings = bookings 
    ? bookings.filter(booking => {
        if (activeTab === "upcoming") {
          return ["requested", "accepted"].includes(booking.status);
        } else if (activeTab === "completed") {
          return ["completed", "approved"].includes(booking.status);
        }
        return true; // all
      })
    : [];
  
  // Function to handle booking status update
  const handleStatusUpdate = (bookingId, newStatus) => {
    updateBookingStatusMutation.mutate({ bookingId, status: newStatus });
  };
  
  // Function to handle payment submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedBooking) return;
    
    createPaymentMutation.mutate({
      bookingId: selectedBooking.id,
      amount: selectedBooking.amount,
      paymentMethod: paymentMethod
    });
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "requested": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-purple-100 text-purple-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Show not authenticated message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to view your bookings.</p>
            <Link href="/auth">
              <Button>
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        
        {/* Tabs and View Mode Switcher */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            {/* Status Tabs */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "upcoming" ? "bg-primary text-white" : "bg-white text-gray-700"}`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-l border-r border-gray-300 ${activeTab === "completed" ? "bg-primary text-white" : "bg-white text-gray-700"}`}
                onClick={() => setActiveTab("completed")}
              >
                Completed
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "all" ? "bg-primary text-white" : "bg-white text-gray-700"}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
            </div>
            
            {/* View Mode Switcher - Only show for users who can have both roles */}
            {(user.role === "provider" || user.role === "admin") && (
              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  className={`px-4 py-2 text-sm font-medium ${viewMode === "made" ? "bg-primary text-white" : "bg-white text-gray-700"}`}
                  onClick={() => setViewMode("made")}
                >
                  Bookings I Made
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${viewMode === "received" ? "bg-primary text-white" : "bg-white text-gray-700"}`}
                  onClick={() => setViewMode("received")}
                >
                  Bookings I Received
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                    <div className="mb-4 lg:mb-0">
                      <div className="flex items-center">
                        <h2 className="text-xl font-bold text-gray-900 mr-3">
                          {booking.serviceName}
                        </h2>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {viewMode === "made" 
                          ? `Provider: ${booking.providerName}` 
                          : `Customer: ${booking.customerName}`}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Action buttons based on booking status and user role */}
                      {viewMode === "received" && booking.status === "requested" && (
                        <>
                          <Button 
                            variant="outline" 
                            className="flex items-center"
                            onClick={() => handleStatusUpdate(booking.id, "accepted")}
                            disabled={updateBookingStatusMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex items-center text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(booking.id, "rejected")}
                            disabled={updateBookingStatusMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </>
                      )}
                      
                      {viewMode === "received" && booking.status === "accepted" && (
                        <Button 
                          className="flex items-center"
                          onClick={() => handleStatusUpdate(booking.id, "completed")}
                          disabled={updateBookingStatusMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Completed
                        </Button>
                      )}
                      
                      {viewMode === "made" && booking.status === "completed" && (
                        <>
                          <Button 
                            variant="outline" 
                            className="flex items-center"
                            onClick={() => handleStatusUpdate(booking.id, "approved")}
                            disabled={updateBookingStatusMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            className="flex items-center"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setPaymentModalOpen(true);
                            }}
                            disabled={updateBookingStatusMutation.isPending}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Pay Now
                          </Button>
                        </>
                      )}
                      
                      {viewMode === "made" && booking.status === "requested" && (
                        <Button 
                          variant="outline" 
                          className="flex items-center text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                          disabled={updateBookingStatusMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start mb-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Scheduled Date</p>
                          <p className="text-gray-600">{formatDate(booking.scheduledDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start mb-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-gray-600">{booking.address}, {booking.city}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Booking Created</p>
                          <p className="text-gray-600">{formatDate(booking.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start mb-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {viewMode === "made" ? "Service Provider" : "Customer"}
                          </p>
                          <p className="text-gray-600">
                            {viewMode === "made" ? booking.providerName : booking.customerName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start mb-3">
                        <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Rate</p>
                          <p className="text-gray-600">${booking.hourlyRate}/hour</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <AlignLeft className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Description</p>
                          <p className="text-gray-600">{booking.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment status if the booking is completed or approved */}
                  {(booking.status === "completed" || booking.status === "approved") && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-gray-700">Payment Status</p>
                        </div>
                        {booking.isPaid ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending Payment
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-7xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h2>
            <p className="text-gray-600 mb-6">
              {activeTab === "upcoming"
                ? "You don't have any upcoming bookings."
                : activeTab === "completed"
                ? "You don't have any completed bookings."
                : "You don't have any bookings yet."}
            </p>
            <Link href="/search">
              <Button>
                Find Services
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Payment Modal */}
      {paymentModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Payment</h3>
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{selectedBooking.serviceName}</span>
                    <span className="text-gray-900 font-medium">${selectedBooking.hourlyRate}/hour</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-medium">Total</span>
                    <span className="text-primary font-bold">${selectedBooking.amount || selectedBooking.hourlyRate}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Payment Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === "credit_card"}
                      onChange={() => setPaymentMethod("credit_card")}
                      className="mr-2"
                    />
                    <span>Credit Card</span>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit_card"
                      checked={paymentMethod === "debit_card"}
                      onChange={() => setPaymentMethod("debit_card")}
                      className="mr-2"
                    />
                    <span>Debit Card</span>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                      className="mr-2"
                    />
                    <span>PayPal</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createPaymentMutation.isPending}
                >
                  {createPaymentMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Pay ${selectedBooking.amount || selectedBooking.hourlyRate}
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