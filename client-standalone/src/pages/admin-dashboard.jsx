import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { formatDate, formatStatus, getStatusColor } from '../lib/utils';

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: activeTab === 'users',
  });
  
  // Fetch service providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/admin/providers'],
    enabled: activeTab === 'providers',
  });
  
  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/admin/bookings'],
    enabled: activeTab === 'bookings',
  });
  
  // Fetch verification requests
  const { data: verificationRequests, isLoading: verificationLoading } = useQuery({
    queryKey: ['/api/admin/verifications'],
    enabled: activeTab === 'verifications',
  });
  
  // Verify provider mutation
  const verifyProviderMutation = useMutation({
    mutationFn: async (providerId) => {
      const res = await apiRequest('POST', `/api/admin/providers/${providerId}/verify`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verifications'] });
      toast({
        title: 'Provider verified',
        description: 'The service provider has been verified successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Reject provider mutation
  const rejectProviderMutation = useMutation({
    mutationFn: async (providerId) => {
      const res = await apiRequest('POST', `/api/admin/providers/${providerId}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verifications'] });
      toast({
        title: 'Provider rejected',
        description: 'The service provider has been rejected.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Rejection failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Get loading state for current tab
  const isLoading = 
    (activeTab === 'users' && usersLoading) ||
    (activeTab === 'providers' && providersLoading) ||
    (activeTab === 'bookings' && bookingsLoading) ||
    (activeTab === 'verifications' && verificationLoading);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Render content based on active tab
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'users':
        return renderUsers();
      case 'providers':
        return renderProviders();
      case 'bookings':
        return renderBookings();
      case 'verifications':
        return renderVerifications();
      default:
        return null;
    }
  };
  
  // Render users tab content
  const renderUsers = () => {
    if (!users || users.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Full Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/20">
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.fullName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
                <td className="px-4 py-2">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render providers tab content
  const renderProviders = () => {
    if (!providers || providers.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No service providers found.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Business Name</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Hourly Rate</th>
              <th className="px-4 py-2 text-left">Rating</th>
              <th className="px-4 py-2 text-left">Verified</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="border-b hover:bg-muted/20">
                <td className="px-4 py-2">{provider.id}</td>
                <td className="px-4 py-2">{provider.businessName}</td>
                <td className="px-4 py-2 capitalize">{provider.category}</td>
                <td className="px-4 py-2">{provider.location}</td>
                <td className="px-4 py-2">${provider.hourlyRate.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    {provider.rating.toFixed(1)}
                  </div>
                </td>
                <td className="px-4 py-2">
                  {provider.verified ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/provider/${provider.id}`)}
                    >
                      View
                    </Button>
                    {!provider.verified && (
                      <Button
                        size="sm"
                        onClick={() => verifyProviderMutation.mutate(provider.id)}
                        disabled={verifyProviderMutation.isPending}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render bookings tab content
  const renderBookings = () => {
    if (!bookings || bookings.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No bookings found.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Provider</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Scheduled Time</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-muted/20">
                <td className="px-4 py-2">{booking.id}</td>
                <td className="px-4 py-2">{booking.customer?.fullName || booking.customer?.username}</td>
                <td className="px-4 py-2">{booking.provider?.businessName || booking.provider?.user?.fullName}</td>
                <td className="px-4 py-2">{booking.service?.name}</td>
                <td className="px-4 py-2">{formatDate(booking.scheduledTime)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`${getStatusColor(
                      booking.status
                    )} text-white text-xs px-2 py-1 rounded-full`}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </td>
                <td className="px-4 py-2">${booking.price?.toFixed(2) || '0.00'}</td>
                <td className="px-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render verifications tab content
  const renderVerifications = () => {
    if (!verificationRequests || verificationRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No verification requests found.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {verificationRequests.map((request) => (
          <div key={request.id} className="bg-card border rounded-lg p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{request.provider.businessName}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {request.provider.category} Provider
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <p className="text-sm">
                  Submitted: {formatDate(request.submittedAt)}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Verification Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.documents.map((doc, index) => (
                  <div key={index} className="border rounded-md p-2">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      View Document
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => rejectProviderMutation.mutate(request.provider.id)}
                disabled={rejectProviderMutation.isPending}
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => verifyProviderMutation.mutate(request.provider.id)}
                disabled={verifyProviderMutation.isPending}
              >
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Get stats for dashboard overview
  const userCount = users?.length || 0;
  const providerCount = providers?.length || 0;
  const verifiedProvidersCount = providers?.filter((p) => p.verified).length || 0;
  const bookingCount = bookings?.length || 0;
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">Total Users</h2>
          <p className="text-3xl font-bold">{userCount}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">Service Providers</h2>
          <p className="text-3xl font-bold">{providerCount}</p>
          <p className="text-xs text-muted-foreground">
            {verifiedProvidersCount} verified
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">Total Bookings</h2>
          <p className="text-3xl font-bold">{bookingCount}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">Pending Verifications</h2>
          <p className="text-3xl font-bold">{verificationRequests?.length || 0}</p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b mb-4">
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'users'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabChange('users')}
          >
            Users
          </button>
          
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'providers'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabChange('providers')}
          >
            Service Providers
          </button>
          
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'bookings'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabChange('bookings')}
          >
            Bookings
          </button>
          
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'verifications'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabChange('verifications')}
          >
            Verification Requests
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="bg-card border rounded-lg p-4">
        {renderContent()}
      </div>
    </div>
  );
}