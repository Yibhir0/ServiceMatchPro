const { storage } = require('./storage');

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

function setupRoutes(app) {
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
      console.error('Error fetching services:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/services", hasRole(['admin']), async (req, res) => {
    try {
      const { name, description, category } = req.body;
      
      if (!name || !description || !category) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const service = await storage.createService({ name, description, category });
      res.status(201).json(service);
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Provider routes
  app.get("/api/providers", async (req, res) => {
    try {
      const { category, city, search } = req.query;
      
      let providers;
      if (category) {
        providers = await storage.getProvidersByCategory(category);
      } else if (city) {
        providers = await storage.getProvidersByCity(city);
      } else if (search) {
        providers = await storage.getProvidersBySearch(search);
      } else {
        providers = Array.from(storage.providerProfiles.values());
      }
      
      // Add service information
      const providersWithService = await Promise.all(providers.map(async provider => {
        const service = await storage.getService(provider.serviceId);
        return {
          ...provider,
          service: service || null
        };
      }));
      
      res.json(providersWithService);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getProviderProfile(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Get related service
      const service = await storage.getService(provider.serviceId);
      
      // Get related credentials
      const credentials = await storage.getCredentials(provider.id);
      
      // Get reviews
      const reviews = await storage.getReviewsByProviderId(provider.id);
      
      // Get provider user info
      const user = await storage.getUser(provider.userId);
      const { password, ...userWithoutPassword } = user || {};
      
      res.json({
        ...provider,
        service: service || null,
        credentials: credentials || [],
        reviews: reviews || [],
        user: userWithoutPassword || null
      });
    } catch (error) {
      console.error('Error fetching provider:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/providers", isAuthenticated, async (req, res) => {
    try {
      const { serviceId, companyName, description, hourlyRate, city, state, availability, phone } = req.body;
      
      // Basic validation
      if (!serviceId || !companyName || !description || !hourlyRate || !city || !state) {
        return res.status(400).json({ message: "Required fields missing" });
      }
      
      // Check if user already has a provider profile
      const existingProfile = await storage.getProviderProfileByUserId(req.user.id);
      if (existingProfile) {
        return res.status(400).json({ message: "User already has a provider profile" });
      }
      
      // Update user role to provider
      await storage.updateUser(req.user.id, { role: 'provider' });
      
      // Create provider profile
      const profile = await storage.createProviderProfile({
        userId: req.user.id,
        serviceId: parseInt(serviceId),
        companyName,
        description,
        hourlyRate: parseFloat(hourlyRate),
        city,
        state,
        availability,
        phone
      });
      
      res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating provider profile:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/providers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getProviderProfile(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Check if user is the provider owner or an admin
      if (provider.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { companyName, description, hourlyRate, city, state, availability, phone, serviceId } = req.body;
      
      const updatedProfile = await storage.updateProviderProfile(id, {
        ...(companyName && { companyName }),
        ...(description && { description }),
        ...(hourlyRate && { hourlyRate: parseFloat(hourlyRate) }),
        ...(city && { city }),
        ...(state && { state }),
        ...(availability && { availability }),
        ...(phone && { phone }),
        ...(serviceId && { serviceId: parseInt(serviceId) })
      });
      
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating provider profile:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Credentials routes
  app.post("/api/credentials", isAuthenticated, async (req, res) => {
    try {
      const { type, licenseNumber, issuingAuthority, issueDate, expiryDate } = req.body;
      
      // Basic validation
      if (!type || !licenseNumber || !issuingAuthority || !issueDate || !expiryDate) {
        return res.status(400).json({ message: "Required fields missing" });
      }
      
      // Get user's provider profile
      const providerProfile = await storage.getProviderProfileByUserId(req.user.id);
      if (!providerProfile) {
        return res.status(400).json({ message: "User has no provider profile" });
      }
      
      // Create credential
      const credential = await storage.createCredential({
        providerId: providerProfile.id,
        type,
        licenseNumber,
        issuingAuthority,
        issueDate,
        expiryDate,
        verificationStatus: 'pending'
      });
      
      res.status(201).json(credential);
    } catch (error) {
      console.error('Error creating credential:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/credentials/:id/verify", hasRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { verificationStatus } = req.body;
      
      if (!verificationStatus || !['verified', 'rejected', 'pending'].includes(verificationStatus)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }
      
      const credential = await storage.updateCredential(id, {
        verificationStatus,
        ...(verificationStatus === 'verified' && { verifiedAt: new Date().toISOString() })
      });
      
      // If verified, update provider verification status
      if (verificationStatus === 'verified') {
        const provider = await storage.getProviderProfile(credential.providerId);
        if (provider) {
          await storage.updateProviderProfile(provider.id, { isVerified: true });
        }
      }
      
      res.json(credential);
    } catch (error) {
      console.error('Error verifying credential:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      let bookings;
      
      if (req.user.role === 'customer') {
        bookings = await storage.getBookingsByCustomerId(req.user.id);
      } else if (req.user.role === 'provider') {
        const providerProfile = await storage.getProviderProfileByUserId(req.user.id);
        if (!providerProfile) {
          return res.status(400).json({ message: "Provider profile not found" });
        }
        bookings = await storage.getBookingsByProviderId(providerProfile.id);
      } else if (req.user.role === 'admin') {
        bookings = Array.from(storage.bookings.values());
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Add details to each booking
      const detailedBookings = await Promise.all(bookings.map(async booking => {
        return await storage.getBookingWithDetails(booking.id);
      }));
      
      res.json(detailedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBookingWithDetails(parseInt(req.params.id));
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user has access to this booking
      if (req.user.role === 'customer' && booking.customerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      } else if (req.user.role === 'provider') {
        const providerProfile = await storage.getProviderProfileByUserId(req.user.id);
        if (!providerProfile || booking.providerId !== providerProfile.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      res.json(booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const { providerId, serviceId, scheduledDate, scheduledTime, duration, address, description } = req.body;
      
      // Basic validation
      if (!providerId || !serviceId || !scheduledDate || !scheduledTime || !duration || !address || !description) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if provider exists
      const provider = await storage.getProviderProfile(parseInt(providerId));
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Calculate total amount
      const totalAmount = provider.hourlyRate * parseFloat(duration);
      
      const booking = await storage.createBooking({
        customerId: req.user.id,
        providerId: parseInt(providerId),
        serviceId: parseInt(serviceId),
        scheduledDate,
        scheduledTime,
        duration: parseFloat(duration),
        address,
        description,
        totalAmount
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bookings/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check permissions based on current status and new status
      if (req.user.role === 'customer') {
        // Customers can cancel a pending or accepted booking, or complete an accepted booking
        if (
          (status === 'cancelled' && ['pending', 'accepted'].includes(booking.status) && booking.customerId === req.user.id) ||
          (status === 'completed' && booking.status === 'accepted' && booking.customerId === req.user.id)
        ) {
          // Allowed
        } else {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (req.user.role === 'provider') {
        // Get provider profile
        const providerProfile = await storage.getProviderProfileByUserId(req.user.id);
        if (!providerProfile || booking.providerId !== providerProfile.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        // Providers can accept or reject pending bookings
        if (
          (status === 'accepted' || status === 'rejected') && 
          booking.status === 'pending'
        ) {
          // Allowed
        } else {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update booking status
      const updatedBooking = await storage.updateBookingStatus(id, status);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Payment routes (mock payment system)
  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const { bookingId, paymentMethod } = req.body;
      
      if (!bookingId || !paymentMethod) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if booking exists
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user is the customer of this booking
      if (booking.customerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({ message: "Booking must be completed before payment" });
      }
      
      // Check if payment already exists
      const existingPayment = await storage.getPaymentByBookingId(parseInt(bookingId));
      if (existingPayment) {
        return res.status(400).json({ message: "Payment already exists for this booking" });
      }
      
      // Create mock payment transaction
      const payment = await storage.createPayment({
        bookingId: parseInt(bookingId),
        amount: booking.totalAmount,
        paymentMethod,
        status: 'completed',
        transactionId: 'mock-transaction-' + Math.floor(Math.random() * 1000000)
      });
      
      res.status(201).json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Review routes
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const { bookingId, rating, comment } = req.body;
      
      if (!bookingId || !rating || !comment) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user is the customer of this booking
      if (booking.customerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({ message: "Booking must be completed before review" });
      }
      
      // Check if payment exists
      const payment = await storage.getPaymentByBookingId(parseInt(bookingId));
      if (!payment || payment.status !== 'completed') {
        return res.status(400).json({ message: "Payment must be completed before review" });
      }
      
      // Check if review already exists
      const existingReview = await storage.getReviewByBookingId(parseInt(bookingId));
      if (existingReview) {
        return res.status(400).json({ message: "Review already exists for this booking" });
      }
      
      // Create review
      const review = await storage.createReview({
        bookingId: parseInt(bookingId),
        providerId: booking.providerId,
        customerId: req.user.id,
        rating: parseInt(rating),
        comment
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin dashboard routes
  app.get("/api/admin/dashboard", hasRole(['admin']), async (req, res) => {
    try {
      const users = Array.from(storage.users.values()).map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      const bookings = Array.from(storage.bookings.values());
      const payments = Array.from(storage.payments.values());
      const providers = Array.from(storage.providerProfiles.values());
      const credentials = Array.from(storage.credentials.values());
      
      // Count statistics
      const stats = {
        totalUsers: users.length,
        totalCustomers: users.filter(user => user.role === 'customer').length,
        totalProviders: users.filter(user => user.role === 'provider').length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(booking => booking.status === 'pending').length,
        completedBookings: bookings.filter(booking => booking.status === 'completed').length,
        totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
        pendingVerifications: credentials.filter(credential => credential.verificationStatus === 'pending').length
      };
      
      res.json({
        stats,
        pendingVerifications: credentials.filter(credential => credential.verificationStatus === 'pending')
      });
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const { password, ...userWithoutPassword } = user;
      
      // Get provider profile if exists
      let providerProfile = null;
      if (user.role === 'provider') {
        providerProfile = await storage.getProviderProfileByUserId(user.id);
      }
      
      // Get bookings
      let bookings = [];
      if (user.role === 'customer') {
        bookings = await storage.getBookingsByCustomerId(user.id);
      } else if (user.role === 'provider' && providerProfile) {
        bookings = await storage.getBookingsByProviderId(providerProfile.id);
      }
      
      res.json({
        user: userWithoutPassword,
        providerProfile,
        bookingsCount: bookings.length
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const { fullName, email } = req.body;
      
      const updates = {};
      if (fullName) updates.fullName = fullName;
      if (email) updates.email = email;
      
      const updatedUser = await storage.updateUser(req.user.id, updates);
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  return app;
}

module.exports = { setupRoutes };