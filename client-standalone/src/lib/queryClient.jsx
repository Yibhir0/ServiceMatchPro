import { QueryClient } from '@tanstack/react-query';

// Helper function to throw if response is not OK
async function throwIfResNotOk(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
  return res;
}

// API request function for making fetch requests
export async function apiRequest(method, url, body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return throwIfResNotOk(response);
}

// QueryFn with handling for 401 responses
export const getQueryFn = ({ on401 = 'throw' } = {}) => {
  return async ({ queryKey }) => {
    const [url] = queryKey;
    
    try {
      const res = await fetch(url, {
        credentials: 'include',
      });
      
      if (res.status === 401) {
        if (on401 === 'returnNull') {
          return null;
        } else {
          throw new Error('Unauthorized');
        }
      }
      
      await throwIfResNotOk(res);
      return res.json();
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  };
};

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});