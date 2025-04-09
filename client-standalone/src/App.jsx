import React from 'react';
import { Switch, Route } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './hooks/use-auth';
import { ProtectedRoute } from './lib/protected-route';
import Header from './components/layout/header';
import Footer from './components/layout/footer';

// Import pages
import HomePage from './pages/home-page';
import AuthPage from './pages/auth-page';
import BookingsPage from './pages/bookings-page';
import ProfilePage from './pages/profile-page';
import ServiceProviderPage from './pages/service-provider-page';
import SearchResultsPage from './pages/search-results';
import AdminDashboardPage from './pages/admin-dashboard';
import NotFoundPage from './pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/search" component={SearchResultsPage} />
      <Route path="/provider/:id" component={ServiceProviderPage} />
      <ProtectedRoute path="/bookings" component={BookingsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminDashboardPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </AuthProvider>
  );
}

export default App;