import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { 
  User, 
  Bell, 
  Menu, 
  X, 
  ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary-600 text-xl font-bold cursor-pointer">HomeHelp</span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/") 
                    ? "border-primary-500 text-neutral-900" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}>
                  Home
                </a>
              </Link>
              <Link href="/search">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/search") 
                    ? "border-primary-500 text-neutral-900" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}>
                  Services
                </a>
              </Link>
              <a href="#how-it-works" className="border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                How It Works
              </a>
              {user?.role === "customer" && (
                <Link href="/bookings">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/bookings") 
                      ? "border-primary-500 text-neutral-900" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}>
                    My Bookings
                  </a>
                </Link>
              )}
              {user?.role === "provider" && (
                <Link href="/bookings">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/bookings") 
                      ? "border-primary-500 text-neutral-900" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}>
                    My Jobs
                  </a>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link href="/admin">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/admin") 
                      ? "border-primary-500 text-neutral-900" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}>
                    Admin Dashboard
                  </a>
                </Link>
              )}
            </nav>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Bell className="h-5 w-5 text-neutral-400 hover:text-neutral-500" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className="bg-primary-500 text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="cursor-pointer w-full flex">Profile</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings">
                        <a className="cursor-pointer w-full flex">
                          {user.role === "customer" ? "My Bookings" : "My Jobs"}
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <a className="cursor-pointer w-full flex">Admin Dashboard</a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button className="ml-4 px-4 py-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-neutral-400" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-sm">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b py-4">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="text-primary-600 text-xl font-bold">HomeHelp</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-auto py-6 px-1">
                    <nav className="flex flex-col space-y-6">
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <a className="text-lg font-medium text-neutral-900">Home</a>
                      </Link>
                      <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
                        <a className="text-lg font-medium text-neutral-900">Services</a>
                      </Link>
                      <a 
                        href="#how-it-works" 
                        className="text-lg font-medium text-neutral-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        How It Works
                      </a>
                      
                      {user ? (
                        <>
                          <div className="border-t pt-6">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.profileImage} alt={user.name} />
                                <AvatarFallback className="bg-primary-500 text-white">
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-neutral-500">{user.email}</p>
                              </div>
                            </div>
                            
                            <div className="mt-6 space-y-6">
                              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                <a className="text-lg font-medium text-neutral-900">Profile</a>
                              </Link>
                              <Link href="/bookings" onClick={() => setIsMobileMenuOpen(false)}>
                                <a className="text-lg font-medium text-neutral-900">
                                  {user.role === "customer" ? "My Bookings" : "My Jobs"}
                                </a>
                              </Link>
                              {user.role === "admin" && (
                                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                                  <a className="text-lg font-medium text-neutral-900">Admin Dashboard</a>
                                </Link>
                              )}
                              <button 
                                onClick={() => {
                                  handleLogout();
                                  setIsMobileMenuOpen(false);
                                }}
                                className="text-lg font-medium text-neutral-900"
                              >
                                Log Out
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="border-t pt-6">
                          <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full">Sign In</Button>
                          </Link>
                        </div>
                      )}
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
