import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind CSS classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format price to currency
export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

// Format date to a readable format
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format status to a human-readable form
export function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}

// Get color for status
export function getStatusColor(status) {
  const statusColors = {
    pending: 'bg-yellow-500',
    accepted: 'bg-blue-500',
    completed: 'bg-green-500',
    canceled: 'bg-red-500',
    paid: 'bg-purple-500',
    rejected: 'bg-gray-500',
  };
  
  return statusColors[status] || 'bg-gray-500';
}

// Filter empty form values
export function filterEmptyValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => 
      value !== undefined && 
      value !== null && 
      value !== ''
    )
  );
}