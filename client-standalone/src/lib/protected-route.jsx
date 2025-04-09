import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { Redirect, Route } from 'wouter';

export function ProtectedRoute({
  path,
  component: Component,
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route
      path={path}
      component={() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Check admin role for admin routes
        if (path === '/admin' && user.role !== 'admin') {
          return <Redirect to="/" />;
        }

        return <Component />;
      }}
    />
  );
}