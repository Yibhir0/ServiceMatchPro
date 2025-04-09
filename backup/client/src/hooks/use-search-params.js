import { useLocation } from 'wouter';

export function useSearchParams() {
  const [location] = useLocation();
  
  // Extract the query string from the location
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  return searchParams;
}