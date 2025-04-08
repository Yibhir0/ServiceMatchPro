import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import { z } from "zod";
import { 
  insertProviderProfileSchema, 
  insertCredentialSchema, 
  insertBookingSchema, 
  insertPaymentSchema, 
  insertReviewSchema
} from "../shared/schema.js";

// Using mock payment instead of Stripe integration

// Helper middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Helper middleware to check role
const hasRole = (roles) => (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  
  next();
};

export async function registerRoutes(app) {
  // Set up authentication routes
  setupAuth(app);
  
  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const category = req.query.category;
      
      let services;
      if (category) {
        services = await storage.getServicesByCategory(category);
      } else {
        services = await storage.getServices();
      }
      
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });
  
  // Provider routes
  app.get("/api/providers", async (req, res) => {
    try {
      const { category, city } = req.query;
      
      const providers = await storage.getProvidersBySearch({
        category: category,
        city: city
      });
      
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });
  
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user || user.role !== "provider") {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      const profile = await storage.getProviderProfileByUserId(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        ...userWithoutPassword,
        providerProfile: profile
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });
  
  app.post("/api/providers/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      
      // Only allow creating a provider profile for your own account
      if (req.body.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate input
      const validatedData = insertProviderProfileSchema.parse(req.body);
      
      // Check if profile already exists
      const existingProfile = await storage.getProviderProfileByUserId(user.id);
      if (existingProfile) {
        return res.status(400).json({ message: "Provider profile already exists" });
      }
      
      // Create profile
      const profile = await storage.createProviderProfile(validatedData);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create provider profile" });
    }
  });
  
  // Credential routes
  app.get("/api/providers/:id/credentials", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getProviderProfileByUserId(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      
      const credentials = await storage.getCredentials(profile.id);
      
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });
  
  app.post("/api/credentials", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      
      // Validate input
      const validatedData = insertCredentialSchema.parse(req.body);
      
      // Get provider profile
      const profile = await storage.getProviderProfileByUserId(user.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      
      // Only allow creating credentials for your own profile
      if (validatedData.providerId !== profile.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create credential
      const credential = await storage.createCredential(validatedData);
      
      res.status(201).json(credential);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create credential" });
    }
  });
  
  app.patch("/api/credentials/:id", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const credential = await storage.updateCredential(id, req.body);
      
      if (!credential) {
        return res.status(404).json({ message: "Credential not found" });
      }
      
      res.json(credential);
    } catch (error) {
      res.status(500).json({ message: "Failed to update credential" });
    }
  });
  
  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      
      let bookings;
      if (user.role === "customer") {
        bookings = await storage.getBookingsByCustomerId(user.id);
      } else if (user.role === "provider") {
        bookings = await storage.getBookingsByProviderId(user.id);
      } else if (user.role === "admin") {
        // Admin can see all bookings (this would need pagination in a real app)
        // Get bookings with IDs 1-100 (for demo purposes)
        const bookingPromises = Array.from({ length: 100 }, (_, i) => storage.getBooking(i + 1));
        bookings = (await Promise.all(bookingPromises)).filter(Boolean);
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      const booking = await storage.getBookingWithDetails(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow viewing bookings related to the user or if admin
      if (user.role !== "admin" && booking.customerId !== user.id && booking.providerId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });
  
  app.post("/api/bookings", isAuthenticated, hasRole(["customer"]), async (req, res) => {
    try {
      const user = req.user;
      
      // Validate input
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Only allow creating bookings for your own account
      if (validatedData.customerId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create booking
      const booking = await storage.createBooking(validatedData);
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  app.patch("/api/bookings/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check permissions based on status and role
      if (status === "accepted" || status === "rejected" || status === "completed") {
        // Only provider or admin can change to these statuses
        if (user.role !== "admin" && (user.role !== "provider" || booking.providerId !== user.id)) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (status === "approved" || status === "cancelled") {
        // Only customer or admin can change to these statuses
        if (user.role !== "admin" && (user.role !== "customer" || booking.customerId !== user.id)) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Update booking status
      const updatedBooking = await storage.updateBookingStatus(id, status);
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  
  // Payment routes
  app.post("/api/payments", isAuthenticated, hasRole(["customer"]), async (req, res) => {
    try {
      const user = req.user;
      
      // Validate input
      const validatedData = insertPaymentSchema.parse(req.body);
      
      // Get the booking to check ownership
      const booking = await storage.getBooking(validatedData.bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow creating payments for your own bookings
      if (booking.customerId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create payment
      const payment = await storage.createPayment(validatedData);
      
      // For mock payment flow, automatically update payment status to completed
      const updatedPayment = await storage.updatePayment(payment.id, { 
        status: "completed",
        transactionId: `mock-${Date.now()}`
      });
      
      // Update booking status to approved after payment
      await storage.updateBookingStatus(booking.id, "approved");
      
      res.status(201).json(updatedPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });
  
  // Review routes
  app.get("/api/providers/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const reviews = await storage.getReviewsByProviderId(id);
      
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  app.post("/api/reviews", isAuthenticated, hasRole(["customer"]), async (req, res) => {
    try {
      const user = req.user;
      
      // Validate input
      const validatedData = insertReviewSchema.parse(req.body);
      
      // Get the booking to check ownership
      const booking = await storage.getBooking(validatedData.bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow creating reviews for your own bookings that are approved
      if (booking.customerId !== user.id || booking.status !== "approved") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check for existing review
      const existingReview = await storage.getReviewByBookingId(booking.id);
      if (existingReview) {
        return res.status(400).json({ message: "Review already exists for this booking" });
      }
      
      // Create review
      const review = await storage.createReview(validatedData);
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  

  
  // Get specific user's bookings (customer or provider)
  app.get("/api/bookings/customer/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      // Only allow viewing your own bookings or if admin
      if (user.role !== "admin" && user.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const bookings = await storage.getBookingsByCustomerId(id);
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  app.get("/api/bookings/provider/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      // Only allow viewing your own bookings or if admin
      if (user.role !== "admin" && user.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const bookings = await storage.getBookingsByProviderId(id);
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  // Get user's provider profile
  app.get("/api/providers/user/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      // Only allow viewing your own profile or if admin
      if (user.role !== "admin" && user.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const profile = await storage.getProviderProfileByUserId(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch provider profile" });
    }
  });

  // Update provider profile
  app.patch("/api/providers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      const profile = await storage.getProviderProfile(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      
      // Only allow updating your own profile or if admin
      if (user.role !== "admin" && profile.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedProfile = await storage.updateProviderProfile(id, req.body);
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update provider profile" });
    }
  });
  
  // Update user profile
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      // Only allow updating your own profile or if admin
      if (user.role !== "admin" && user.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Prevent changing role unless admin
      if (req.body.role && user.role !== "admin") {
        return res.status(403).json({ message: "Cannot change role" });
      }
      
      // Prevent changing password through this endpoint
      delete req.body.password;
      
      const updatedUser = await storage.updateUser(id, req.body);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Get cities for location filtering
  app.get("/api/cities", async (req, res) => {
    try {
      // In a real app, this would be a database query
      // For demo, just return some sample cities
      const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];
      
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });
  
  // Admin routes
  app.get("/api/admin/users", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      // In a real app, this would have pagination
      // Get all users with IDs 1-100 (for demo purposes)
      const userPromises = Array.from({ length: 100 }, (_, i) => storage.getUser(i + 1));
      const users = (await Promise.all(userPromises)).filter(Boolean);
      
      // Remove passwords
      const safeUsers = users.map(user => {
        if (!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }).filter(Boolean);
      
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/admin/providers", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      // Get provider profiles
      const profiles = await storage.getProvidersBySearch({});
      
      // Enhance with user data
      const enhancedProfiles = await Promise.all(profiles.map(async (profile) => {
        const user = await storage.getUser(profile.userId);
        
        if (!user) return profile;
        
        // Remove password from user data
        const { password, ...userWithoutPassword } = user;
        
        return {
          ...profile,
          user: userWithoutPassword
        };
      }));
      
      res.json(enhancedProfiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });
  
  app.get("/api/admin/bookings", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      // In a real app, this would have pagination
      // Get bookings with IDs 1-100 (for demo purposes)
      const bookingPromises = Array.from({ length: 100 }, (_, i) => storage.getBookingWithDetails(i + 1));
      const bookings = (await Promise.all(bookingPromises)).filter(Boolean);
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  app.patch("/api/admin/providers/:id/verify", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isVerified } = req.body;
      
      if (isVerified === undefined) {
        return res.status(400).json({ message: "isVerified field is required" });
      }
      
      const updatedProfile = await storage.updateProviderProfile(id, { isVerified });
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update provider verification status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}