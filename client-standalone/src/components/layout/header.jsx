import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  
  const isActive = (path) => location === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    closeMenu();
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-primary">
            ServiceMatchPro
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-sm ${isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className={`text-sm ${isActive('/search') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
            >
              Find Services
            </Link>
            
            {user && (
              <Link 
                href="/bookings" 
                className={`text-sm ${isActive('/bookings') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
              >
                My Bookings
              </Link>
            )}
            
            {user && user.role === 'admin' && (
              <Link 
                href="/admin" 
                className={`text-sm ${isActive('/admin') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Authentication Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className={`text-sm flex items-center space-x-1 ${isActive('/profile') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </div>
                  <span>Profile</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    'Logout'
                  )}
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-3 py-3">
              <Link 
                href="/" 
                className={`px-2 py-1 rounded ${isActive('/') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                href="/search" 
                className={`px-2 py-1 rounded ${isActive('/search') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                onClick={closeMenu}
              >
                Find Services
              </Link>
              
              {user && (
                <Link 
                  href="/bookings" 
                  className={`px-2 py-1 rounded ${isActive('/bookings') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                  onClick={closeMenu}
                >
                  My Bookings
                </Link>
              )}
              
              {user && user.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className={`px-2 py-1 rounded ${isActive('/admin') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                  onClick={closeMenu}
                >
                  Admin Dashboard
                </Link>
              )}
              
              {user ? (
                <>
                  <Link 
                    href="/profile" 
                    className={`px-2 py-1 rounded ${isActive('/profile') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <button 
                    className="text-left px-2 py-1 rounded text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="px-2 py-1 rounded bg-primary text-primary-foreground text-center"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}