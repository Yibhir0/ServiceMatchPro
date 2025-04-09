import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest('PUT', '/api/profile', data);
      return res.json();
    },
    onSuccess: (data) => {
      // Update the user in the cache
      queryClient.setQueryData(['/api/user'], (oldData) => ({
        ...oldData,
        ...data,
      }));
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };
  
  // If the user is a provider, determine if they have a provider profile
  const hasProviderProfile = user?.role === 'provider';
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-medium">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{user?.fullName || user?.username}</h2>
            <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
            <p className="text-sm">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
      
      {user?.role === 'provider' && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Service Provider Profile</h2>
          
          {hasProviderProfile ? (
            <div className="space-y-4">
              <p>
                Manage your service provider profile, services, and credentials.
              </p>
              <Button variant="outline">
                Manage Provider Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                You don't have a service provider profile yet. Create one to start offering your services.
              </p>
              <Button>
                Create Provider Profile
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Account Settings */}
      <div className="bg-card border rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Change Password</h3>
            <Button variant="outline">
              Update Password
            </Button>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Notifications</h3>
            <Button variant="outline">
              Manage Notifications
            </Button>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}