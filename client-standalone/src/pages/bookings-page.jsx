import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { formatDate, formatStatus, getStatusColor } from '../lib/utils';

export default function BookingsPage() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState('all');
  
  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/bookings'],
  });

  // Filter bookings based on selected filter
  const filteredBookings = bookings
    ? filter === 'all'
      ? bookings
      : bookings.filter((booking) => booking.status === filter)
    : [];

  const getStatusOptions = () => {
    if (!bookings || bookings.length === 0) return [];
    
    // Get unique status values from bookings
    const statusSet = new Set(bookings.map((booking) => booking.status));
    return Array.from(statusSet);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">My Bookings</h1>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          
          {getStatusOptions().map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {formatStatus(status)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="bg-background border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No bookings found</h2>
          <p className="text-muted-foreground mb-4">
            You don't have any bookings yet. Start by finding a service provider.
          </p>
          <Button onClick={() => navigate('/search')}>
            Find Services
          </Button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-background border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No {filter} bookings</h2>
          <p className="text-muted-foreground mb-4">
            You don't have any bookings with the "{filter}" status.
          </p>
          <Button variant="outline" onClick={() => setFilter('all')}>
            Show All Bookings
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-card border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {booking.service?.name || 'Service'}
                    </h3>
                    <span
                      className={`${getStatusColor(
                        booking.status
                      )} text-white text-xs px-2 py-1 rounded-full`}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    Provider: {booking.provider?.businessName || booking.provider?.user?.fullName || 'Provider Name'}
                  </p>
                  
                  <div className="space-y-1">
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
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {formatDate(booking.scheduledTime)}
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
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {booking.address || 'Address not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col items-end justify-between">
                  <div className="text-right">
                    <p className="text-lg font-bold">${booking.price?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-muted-foreground">Booking ID: #{booking.id}</p>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/bookings/${booking.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}