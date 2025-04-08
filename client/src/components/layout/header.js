import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => location === path;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                HomeHelp
              </span>
            </a>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/">
            <a className={`text-sm font-medium ${isActive("/") ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
              Home
            </a>
          </Link>
          <Link href="/search">
            <a className={`text-sm font-medium ${isActive("/search") ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
              Find Services
            </a>
          </Link>
          {user && (
            <>
              <Link href="/bookings">
                <a className={`text-sm font-medium ${isActive("/bookings") ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
                  My Bookings
                </a>
              </Link>
              <Link href="/profile">
                <a className={`text-sm font-medium ${isActive("/profile") ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
                  Profile
                </a>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin">
                  <a className={`text-sm font-medium ${isActive("/admin") ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
                    Admin
                  </a>
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Button 
              variant="ghost" 
              onClick={() => logoutMutation.mutate()}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth">
              <Button 
                variant={isActive("/auth") ? "default" : "outline"} 
                className={isActive("/auth") ? "" : "border-primary text-primary hover:bg-primary/10"}
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <button onClick={toggleMobileMenu} className="md:hidden">
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 space-y-4 bg-white border-t border-gray-100">
          <Link href="/">
            <a className={`block py-2 ${isActive("/") ? "text-primary" : "text-gray-600"}`}>
              Home
            </a>
          </Link>
          <Link href="/search">
            <a className={`block py-2 ${isActive("/search") ? "text-primary" : "text-gray-600"}`}>
              Find Services
            </a>
          </Link>
          {user ? (
            <>
              <Link href="/bookings">
                <a className={`block py-2 ${isActive("/bookings") ? "text-primary" : "text-gray-600"}`}>
                  My Bookings
                </a>
              </Link>
              <Link href="/profile">
                <a className={`block py-2 ${isActive("/profile") ? "text-primary" : "text-gray-600"}`}>
                  Profile
                </a>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin">
                  <a className={`block py-2 ${isActive("/admin") ? "text-primary" : "text-gray-600"}`}>
                    Admin
                  </a>
                </Link>
              )}
              <Button 
                onClick={() => logoutMutation.mutate()}
                variant="ghost"
                className="w-full justify-start text-gray-600 px-0"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <a className={`block py-2 ${isActive("/auth") ? "text-primary" : "text-gray-600"}`}>
                Sign In
              </a>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}