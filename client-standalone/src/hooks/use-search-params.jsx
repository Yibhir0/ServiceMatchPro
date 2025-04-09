import { useLocation } from 'wouter';

export function useSearchParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1] || '');
}