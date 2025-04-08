import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, Briefcase, CalendarDays, Settings, CheckCircle,
  Search, Shield, AlertTriangle, XCircle, BarChart3, Check,
  UserPlus, Download
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "users", "providers", "bookings", "services"
  const [searchQuery, setSearchQuery] = useState("");
  const [verifying, setVerifying] = useState(null);
  
  // Fetch users
  const { 
    data: users, 
    isLoading: usersLoading 
  } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin" && (activeTab === "dashboard" || activeTab === "users"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch providers
  const { 
    data: providers, 
    isLoading: providersLoading
  } = useQuery({
    queryKey: ["/api/admin/providers"],
    enabled: user?.role === "admin" && (activeTab === "dashboard" || activeTab === "providers"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch bookings
  const { 
    data: bookings, 
    isLoading: bookingsLoading
  } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: user?.role === "admin" && (activeTab === "dashboard" || activeTab === "bookings"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch services
  const { 
    data: services, 
    isLoading: servicesLoading
  } = useQuery({
    queryKey: ["/api/services"],
    enabled: user?.role === "admin" && (activeTab === "dashboard" || activeTab === "services"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Verify provider mutation
  const verifyProviderMutation = useMutation({
    mutationFn: async ({ providerId, isVerified }) => {
      const res = await apiRequest("PATCH", `/api/admin/providers/${providerId}/verify`, { isVerified });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/admin/providers"]);
      toast({
        title: "Provider Updated",
        description: "The provider's verification status has been updated.",
        variant: "default",
      });
      setVerifying(null);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle provider verification
  const handleVerify = (providerId, isVerified) => {
    setVerifying(providerId);
    verifyProviderMutation.mutate({ providerId, isVerified });
  };
  
  // Filter data based on search query
  const filteredUsers = users 
    ? users.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  const filteredProviders = providers 
    ? providers.filter(p => 
        p.user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${p.user?.firstName} ${p.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  const filteredBookings = bookings 
    ? bookings.filter(b => 
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  const filteredServices = services 
    ? services.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper function to count user types
  const countUsersByRole = (role) => {
    return users ? users.filter(user => user.role === role).length : 0;
  };
  
  // Helper function to count bookings by status
  const countBookingsByStatus = (status) => {
    return bookings ? bookings.filter(booking => booking.status === status).length : 0;
  };
  
  // Helper function to get status badge color
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
  
  // Show not authenticated or not authorized message
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {!user 
                ? "Please sign in to access this page." 
                : "You don't have permission to access the admin dashboard."}
            </p>
            <Link href={user ? "/" : "/auth"}>
              <Button>
                {user ? "Go to Home" : "Sign In"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="bg-white border-r border-gray-200 w-full md:w-64 md:min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center px-4 py-3 rounded-md ${
                    activeTab === "dashboard" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center px-4 py-3 rounded-md ${
                    activeTab === "users" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("providers")}
                  className={`w-full flex items-center px-4 py-3 rounded-md ${
                    activeTab === "providers" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Briefcase className="h-5 w-5 mr-3" />
                  Providers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center px-4 py-3 rounded-md ${
                    activeTab === "bookings" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <CalendarDays className="h-5 w-5 mr-3" />
                  Bookings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`w-full flex items-center px-4 py-3 rounded-md ${
                    activeTab === "services" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Services
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow p-6">
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{users?.length || 0}</p>
                  <div className="mt-2 flex text-sm space-x-4">
                    <span className="text-gray-600">Customers: {countUsersByRole("customer")}</span>
                    <span className="text-gray-600">Providers: {countUsersByRole("provider")}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Pending Verifications</h3>
                    <Shield className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {providers?.filter(p => !p.isVerified).length || 0}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Providers awaiting verification
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Active Bookings</h3>
                    <CalendarDays className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {countBookingsByStatus("requested") + countBookingsByStatus("accepted")}
                  </p>
                  <div className="mt-2 flex text-sm space-x-4">
                    <span className="text-gray-600">Requested: {countBookingsByStatus("requested")}</span>
                    <span className="text-gray-600">Accepted: {countBookingsByStatus("accepted")}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Completed Services</h3>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {countBookingsByStatus("completed") + countBookingsByStatus("approved")}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Successfully completed bookings
                  </p>
                </div>
              </div>
              
              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
                </div>
                <div className="p-6">
                  {bookingsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div className="flex-grow">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : bookings && bookings.length > 0 ? (
                    <div className="space-y-6">
                      {bookings.slice(0, 5).map(booking => (
                        <div key={booking.id} className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              booking.status === "requested" ? "bg-yellow-100 text-yellow-600" :
                              booking.status === "accepted" ? "bg-blue-100 text-blue-600" :
                              booking.status === "completed" ? "bg-purple-100 text-purple-600" :
                              booking.status === "approved" ? "bg-green-100 text-green-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {booking.status === "requested" ? "R" :
                               booking.status === "accepted" ? "A" :
                               booking.status === "completed" ? "C" :
                               booking.status === "approved" ? "✓" : "X"}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.customerName} booked {booking.serviceName} with {booking.providerName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.createdAt)} • Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No recent activities to display.</p>
                  )}
                  
                  {bookings && bookings.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab("bookings")}
                      >
                        View All Bookings
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Verification Requests */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Pending Verification Requests</h3>
                </div>
                <div className="p-6">
                  {providersLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="py-4 flex items-center justify-between border-b border-gray-200 last:border-0">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                            <div>
                              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  ) : providers && providers.filter(p => !p.isVerified).length > 0 ? (
                    <div>
                      {providers
                        .filter(p => !p.isVerified)
                        .slice(0, 5)
                        .map(provider => (
                          <div key={provider.id} className="py-4 flex items-center justify-between border-b border-gray-200 last:border-0">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                                {provider.user?.profileImage ? (
                                  <img 
                                    src={provider.user.profileImage} 
                                    alt={provider.user.firstName}
                                    className="h-full w-full object-cover" 
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm uppercase">
                                    {provider.user?.firstName?.charAt(0) || ''}
                                    {provider.user?.lastName?.charAt(0) || ''}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{provider.user.firstName} {provider.user.lastName}</h4>
                                <p className="text-sm text-gray-600 capitalize">{provider.category}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleVerify(provider.id, true)}
                              disabled={verifying === provider.id}
                              className="flex items-center"
                            >
                              {verifying === provider.id ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Verifying...
                                </span>
                              ) : (
                                <>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Verify
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No pending verification requests.</p>
                  )}
                  
                  {providers && providers.filter(p => !p.isVerified).length > 5 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab("providers")}
                      >
                        View All Requests
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Users Management */}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Button className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add User
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          City
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {usersLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                            </td>
                          </tr>
                        ))
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                                  {user.profileImage ? (
                                    <img 
                                      src={user.profileImage} 
                                      alt={user.firstName}
                                      className="h-full w-full object-cover" 
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs uppercase">
                                      {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "admin" 
                                  ? "bg-purple-100 text-purple-800" 
                                  : user.role === "provider"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                              }`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.city || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link href={`/profile/${user.id}`}>
                                <a className="text-primary hover:text-primary/80 mr-4">
                                  View
                                </a>
                              </Link>
                              <button className="text-gray-600 hover:text-gray-900">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No users found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {users && users.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Showing {filteredUsers.length} of {users.length} users
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Providers Management */}
          {activeTab === "providers" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Providers Management</h2>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          City
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hourly Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verification
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {providersLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-gray-200 rounded-full mr-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-12"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                            </td>
                          </tr>
                        ))
                      ) : filteredProviders.length > 0 ? (
                        filteredProviders.map(provider => (
                          <tr key={provider.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                                  {provider.user?.profileImage ? (
                                    <img 
                                      src={provider.user.profileImage} 
                                      alt={provider.user.firstName}
                                      className="h-full w-full object-cover" 
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs uppercase">
                                      {provider.user?.firstName?.charAt(0) || ''}{provider.user?.lastName?.charAt(0) || ''}
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium text-gray-900">
                                  {provider.user?.firstName} {provider.user?.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="capitalize">{provider.category}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {provider.city}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              ${provider.hourlyRate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span>{provider.rating?.toFixed(1) || "N/A"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {provider.isVerified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="mr-1 h-3 w-3" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link href={`/providers/${provider.id}`}>
                                <a className="text-primary hover:text-primary/80 mr-4">
                                  View
                                </a>
                              </Link>
                              {!provider.isVerified ? (
                                <button 
                                  className="text-green-600 hover:text-green-800 mr-4"
                                  onClick={() => handleVerify(provider.id, true)}
                                  disabled={verifying === provider.id}
                                >
                                  {verifying === provider.id ? "Verifying..." : "Verify"}
                                </button>
                              ) : (
                                <button 
                                  className="text-red-600 hover:text-red-800 mr-4"
                                  onClick={() => handleVerify(provider.id, false)}
                                  disabled={verifying === provider.id}
                                >
                                  {verifying === provider.id ? "Updating..." : "Unverify"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                            No providers found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {providers && providers.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Showing {filteredProviders.length} of {providers.length} providers
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Bookings Management */}
          {activeTab === "bookings" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookingsLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-10"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                            </td>
                          </tr>
                        ))
                      ) : filteredBookings.length > 0 ? (
                        filteredBookings.map(booking => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              #{booking.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.serviceName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.providerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {formatDate(booking.scheduledDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {booking.isPaid ? (
                                <span className="text-green-600 font-medium">Paid</span>
                              ) : (
                                <span className="text-yellow-600 font-medium">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                            No bookings found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {bookings && bookings.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Showing {filteredBookings.length} of {bookings.length} bookings
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Services Management */}
          {activeTab === "services" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Button className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Add Service
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {servicesLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-10"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-48"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                            </td>
                          </tr>
                        ))
                      ) : filteredServices.length > 0 ? (
                        filteredServices.map(service => (
                          <tr key={service.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              #{service.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {service.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                service.category === "plumbing" 
                                  ? "bg-blue-100 text-blue-800" 
                                  : service.category === "electrical"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}>
                                {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 truncate max-w-md">
                                {service.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-primary hover:text-primary/80 mr-4">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No services found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}