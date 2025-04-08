import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  roles = [],
}: {
  path: string;
  component: () => React.JSX.Element;
  roles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user has one of the required roles
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-neutral-600">
              You don't have permission to access this page. This area is restricted to {roles.join(' or ')} users.
            </p>
            <div className="mt-6">
              <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
