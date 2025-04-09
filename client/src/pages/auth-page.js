import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, User, Lock, Mail, UserPlus, LogIn } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "customer",
  });
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };
  
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };
  
  const updateLoginField = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };
  
  const updateRegisterField = (field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  };
  
  // If user is logged in, don't show this page
  if (user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Left column - Auth Form */}
            <div className="w-full md:w-1/2 p-6 md:p-12">
              <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {isLogin ? "Welcome Back" : "Create Your Account"}
                </h1>
                <p className="text-gray-600">
                  {isLogin 
                    ? "Sign in to access your HomeHelp account" 
                    : "Join HomeHelp to connect with verified service professionals"
                  }
                </p>
              </div>
              
              {isLogin ? (
                // LOGIN FORM
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <User size={18} />
                      </span>
                      <input
                        id="login-username"
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Enter your username"
                        value={loginForm.username}
                        onChange={(e) => updateLoginField("username", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </span>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => updateLoginField("password", e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full flex items-center justify-center"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </span>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                // REGISTRATION FORM
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        id="firstName"
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={registerForm.firstName}
                        onChange={(e) => updateRegisterField("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        id="lastName"
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={registerForm.lastName}
                        onChange={(e) => updateRegisterField("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <User size={18} />
                      </span>
                      <input
                        id="register-username"
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Choose a username"
                        value={registerForm.username}
                        onChange={(e) => updateRegisterField("username", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </span>
                      <input
                        id="register-email"
                        type="email"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => updateRegisterField("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </span>
                      <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => updateRegisterField("password", e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`
                        cursor-pointer border rounded-md p-3 flex items-center 
                        ${registerForm.role === "customer" 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-gray-300 text-gray-700"}
                      `}>
                        <input
                          type="radio"
                          name="role"
                          className="sr-only"
                          value="customer"
                          checked={registerForm.role === "customer"}
                          onChange={(e) => updateRegisterField("role", e.target.value)}
                        />
                        <span className="font-medium">Customer</span>
                      </label>
                      
                      <label className={`
                        cursor-pointer border rounded-md p-3 flex items-center 
                        ${registerForm.role === "provider" 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-gray-300 text-gray-700"}
                      `}>
                        <input
                          type="radio"
                          name="role"
                          className="sr-only"
                          value="provider"
                          checked={registerForm.role === "provider"}
                          onChange={(e) => updateRegisterField("role", e.target.value)}
                        />
                        <span className="font-medium">Service Provider</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full flex items-center justify-center"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              )}
              
              <div className="mt-6 text-center">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
            
            {/* Right column - Hero Content */}
            <div className="hidden md:block w-1/2 bg-gradient-to-b from-primary/90 to-blue-700 p-12 text-white">
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-6">
                  {isLogin 
                    ? "Welcome back to HomeHelp" 
                    : "Join the HomeHelp community"
                  }
                </h2>
                <p className="text-lg mb-8 text-white/80">
                  {isLogin
                    ? "Access your account to manage bookings, view service history, and connect with trusted professionals."
                    : "Create an account to book verified home service professionals in your area with confidence and ease."
                  }
                </p>
                
                <div className="space-y-6 mt-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 rounded-full bg-white/20 p-1">
                      <CheckIcon className="h-5 w-5" />
                    </div>
                    <p className="text-white/90">Verified service providers</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 rounded-full bg-white/20 p-1">
                      <CheckIcon className="h-5 w-5" />
                    </div>
                    <p className="text-white/90">Secure online booking</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 rounded-full bg-white/20 p-1">
                      <CheckIcon className="h-5 w-5" />
                    </div>
                    <p className="text-white/90">Satisfaction guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}