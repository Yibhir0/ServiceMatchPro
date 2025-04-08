import { 
  users, services, providerProfiles, credentials, bookings, payments, reviews
} from "../shared/schema.js";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.providerProfiles = new Map();
    this.credentials = new Map();
    this.bookings = new Map();
    this.payments = new Map();
    this.reviews = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    this.userId = 1;
    this.serviceId = 1;
    this.providerProfileId = 1;
    this.credentialId = 1;
    this.bookingId = 1;
    this.paymentId = 1;
    this.reviewId = 1;
    
    // Initialize sample data
    this.initializeData();
  }
  
  async initializeData() {
    // Initialize services
    this.initializeServices();
    
    // Initialize users
    await this.initializeUsers();
    
    // Initialize provider profiles
    await this.initializeProviderProfiles();
    
    // Initialize credentials
    await this.initializeCredentials();
    
    // Initialize bookings
    await this.initializeBookings();
  }
  
  initializeServices() {
    const services = [
      { name: "Plumbing Repair", description: "Fix leaks, clogs, and other plumbing issues", category: "plumbing" },
      { name: "Pipe Installation", description: "Install new pipes and plumbing systems", category: "plumbing" },
      { name: "Fixture Installation", description: "Install faucets, showers, and other fixtures", category: "plumbing" },
      { name: "Electrical Repair", description: "Fix electrical issues and wiring problems", category: "electrical" },
      { name: "Lighting Installation", description: "Install new lighting fixtures and systems", category: "electrical" },
      { name: "Outlet and Switch Installation", description: "Install or replace electrical outlets and switches", category: "electrical" },
      { name: "Lawn Maintenance", description: "Regular lawn care and maintenance", category: "landscaping" },
      { name: "Garden Design", description: "Design and implement garden layouts", category: "landscaping" },
      { name: "Tree Trimming", description: "Trim and maintain trees on your property", category: "landscaping" }
    ];
    
    services.forEach(service => {
      this.createService(service);
    });
  }
  
  async initializeUsers() {
    // Create admin user
    await this.createUser({
      username: "admin",
      password: "admin123", // This would be hashed in a real scenario
      email: "admin@homeservices.com",
      firstName: "Admin",
      lastName: "User",
      phone: "555-0000",
      role: "admin",
      city: null,
      bio: null,
      profileImage: null
    });
    
    // Create provider users
    const providers = [
      {
        username: "johnplumber",
        password: "pass123",
        email: "john@plumbingpros.com",
        firstName: "John",
        lastName: "Wilson",
        phone: "555-1234",
        role: "provider",
        city: "New York",
        bio: "Professional plumber with over 15 years of experience",
        profileImage: null
      },
      {
        username: "sarahelectric",
        password: "pass123",
        email: "sarah@electricalexperts.com",
        firstName: "Sarah",
        lastName: "Johnson",
        phone: "555-2345",
        role: "provider",
        city: "Chicago",
        bio: "Certified electrician offering reliable and safe electrical services",
        profileImage: null
      },
      {
        username: "mikegreen",
        password: "pass123",
        email: "mike@greenthumb.com",
        firstName: "Mike",
        lastName: "Green",
        phone: "555-3456",
        role: "provider",
        city: "Los Angeles",
        bio: "Dedicated landscaper with a passion for creating beautiful outdoor spaces",
        profileImage: null
      }
    ];
    
    for (const provider of providers) {
      await this.createUser(provider);
    }
    
    // Create customer users
    const customers = [
      {
        username: "customer1",
        password: "pass123",
        email: "customer1@example.com",
        firstName: "Alex",
        lastName: "Smith",
        phone: "555-4567",
        role: "customer",
        city: "New York",
        bio: null,
        profileImage: null
      },
      {
        username: "customer2",
        password: "pass123",
        email: "customer2@example.com",
        firstName: "Jamie",
        lastName: "Taylor",
        phone: "555-5678",
        role: "customer",
        city: "Chicago",
        bio: null,
        profileImage: null
      },
      {
        username: "customer3",
        password: "pass123",
        email: "customer3@example.com",
        firstName: "Jordan",
        lastName: "Brown",
        phone: "555-6789",
        role: "customer",
        city: "Los Angeles",
        bio: null,
        profileImage: null
      }
    ];
    
    for (const customer of customers) {
      await this.createUser(customer);
    }
  }
  
  async initializeProviderProfiles() {
    // Find provider users
    const allUsers = Array.from(this.users.values());
    const providerUsers = allUsers.filter(user => user.role === "provider");
    
    // Create provider profiles
    const profiles = [
      {
        userId: providerUsers[0].id,
        bio: "Professional plumber with over 15 years of experience. Specializing in residential plumbing repairs and installations.",
        category: "plumbing",
        hourlyRate: 75,
        city: "New York",
        isVerified: true,
        rating: 4.8,
        workImages: null,
        yearsOfExperience: 15
      },
      {
        userId: providerUsers[1].id,
        bio: "Certified electrician offering reliable and safe electrical services. Available for both emergency repairs and planned projects.",
        category: "electrical",
        hourlyRate: 85,
        city: "Chicago",
        isVerified: true,
        rating: 4.7,
        workImages: null,
        yearsOfExperience: 10
      },
      {
        userId: providerUsers[2].id,
        bio: "Dedicated landscaper with a passion for creating beautiful outdoor spaces. Providing lawn care, garden design, and more.",
        category: "landscaping",
        hourlyRate: 65,
        city: "Los Angeles",
        isVerified: true,
        rating: 4.9,
        workImages: null,
        yearsOfExperience: 8
      }
    ];
    
    for (const profile of profiles) {
      await this.createProviderProfile(profile);
    }
  }
  
  async initializeCredentials() {
    // Find provider profiles
    const profiles = Array.from(this.providerProfiles.values());
    
    // Create credentials for each provider
    for (const profile of profiles) {
      await this.createCredential({
        providerId: profile.id,
        type: "license",
        number: `LIC-${Math.floor(1000 + Math.random() * 9000)}`,
        description: "Professional license",
        issuedBy: "State Board",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      });
      
      await this.createCredential({
        providerId: profile.id,
        type: "insurance",
        number: `INS-${Math.floor(1000 + Math.random() * 9000)}`,
        description: "Liability insurance",
        issuedBy: "Insurance Co.",
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months from now
      });
    }
  }
  
  async initializeBookings() {
    // Get users, providers, and services
    const customers = Array.from(this.users.values()).filter(user => user.role === "customer");
    const providerProfiles = Array.from(this.providerProfiles.values());
    const services = Array.from(this.services.values());
    
    // Create sample bookings
    const bookings = [
      {
        customerId: customers[0].id,
        providerId: providerProfiles[0].userId,
        serviceId: services.find(s => s.category === "plumbing")?.id || 1,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        address: "123 Main St",
        city: "New York",
        status: "requested",
        description: "Need to fix a leaky faucet in the kitchen."
      },
      {
        customerId: customers[1].id,
        providerId: providerProfiles[1].userId,
        serviceId: services.find(s => s.category === "electrical")?.id || 4,
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        address: "456 Oak Ave",
        city: "Chicago",
        status: "accepted",
        description: "Need to install new lighting fixtures in the living room."
      },
      {
        customerId: customers[2].id,
        providerId: providerProfiles[2].userId,
        serviceId: services.find(s => s.category === "landscaping")?.id || 7,
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        address: "789 Pine Blvd",
        city: "Los Angeles",
        status: "completed",
        description: "Need lawn maintenance and garden cleanup."
      }
    ];
    
    for (const booking of bookings) {
      const createdBooking = await this.createBooking(booking);
      
      // For completed booking, create payment and review
      if (booking.status === "completed") {
        const payment = await this.createPayment({
          bookingId: createdBooking.id,
          amount: (providerProfiles.find(p => p.userId === booking.providerId)?.hourlyRate || 75) * 2, // 2 hours of work
          paymentMethod: "credit_card",
          transactionId: `TR-${Math.floor(1000 + Math.random() * 9000)}`
        });
        
        await this.createReview({
          bookingId: createdBooking.id,
          providerId: booking.providerId,
          customerId: booking.customerId,
          rating: 5,
          comment: "Excellent service! Very professional and thorough."
        });
      }
    }
  }
  
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user) {
    const id = this.userId++;
    const newUser = { 
      ...user, 
      id,
      role: user.role || "customer",
      city: user.city || null,
      phone: user.phone || null,
      bio: user.bio || null,
      profileImage: user.profileImage || null
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id, userData) {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Service operations
  async getService(id) {
    return this.services.get(id);
  }
  
  async getServices() {
    return Array.from(this.services.values());
  }
  
  async getServicesByCategory(category) {
    return Array.from(this.services.values()).filter(service => service.category === category);
  }
  
  async createService(service) {
    const id = this.serviceId++;
    const newService = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }
  
  // Provider profile operations
  async getProviderProfile(id) {
    return this.providerProfiles.get(id);
  }
  
  async getProviderProfileByUserId(userId) {
    return Array.from(this.providerProfiles.values()).find(profile => profile.userId === userId);
  }
  
  async getProvidersByCategory(category) {
    const providers = [];
    
    for (const profile of this.providerProfiles.values()) {
      if (profile.category === category) {
        const user = this.users.get(profile.userId);
        if (user && user.role === "provider") {
          providers.push({ ...user, providerProfile: profile });
        }
      }
    }
    
    return providers;
  }
  
  async getProvidersByCity(city) {
    const providers = [];
    
    for (const profile of this.providerProfiles.values()) {
      if (profile.city === city) {
        const user = this.users.get(profile.userId);
        if (user && user.role === "provider") {
          providers.push({ ...user, providerProfile: profile });
        }
      }
    }
    
    return providers;
  }
  
  async getProvidersBySearch(query) {
    const { category, city } = query;
    const providers = [];
    
    for (const profile of this.providerProfiles.values()) {
      const categoryMatch = !category || profile.category === category;
      const cityMatch = !city || profile.city === city;
      
      if (categoryMatch && cityMatch) {
        const user = this.users.get(profile.userId);
        if (user && user.role === "provider") {
          providers.push({ ...user, providerProfile: profile });
        }
      }
    }
    
    return providers;
  }
  
  async createProviderProfile(profile) {
    const id = this.providerProfileId++;
    const newProfile = { 
      ...profile, 
      id,
      isVerified: profile.isVerified || false,
      rating: profile.rating || 0,
      workImages: profile.workImages || null,
      yearsOfExperience: profile.yearsOfExperience || 0
    };
    this.providerProfiles.set(id, newProfile);
    return newProfile;
  }
  
  async updateProviderProfile(id, profileData) {
    const profile = this.providerProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.providerProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // Credential operations
  async getCredentials(providerId) {
    return Array.from(this.credentials.values()).filter(credential => credential.providerId === providerId);
  }
  
  async createCredential(credential) {
    const id = this.credentialId++;
    const newCredential = { 
      ...credential, 
      id,
      submittedAt: new Date(),
      verifiedAt: credential.isVerified ? new Date() : null
    };
    this.credentials.set(id, newCredential);
    return newCredential;
  }
  
  async updateCredential(id, credentialData) {
    const credential = this.credentials.get(id);
    if (!credential) return undefined;
    
    const updatedCredential = { ...credential, ...credentialData };
    this.credentials.set(id, updatedCredential);
    return updatedCredential;
  }
  
  // Booking operations
  async getBooking(id) {
    return this.bookings.get(id);
  }
  
  async getBookingWithDetails(id) {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const customer = this.users.get(booking.customerId);
    
    const provider = this.users.get(booking.providerId);
    const providerProfile = provider ? await this.getProviderProfileByUserId(provider.id) : undefined;
    
    const service = this.services.get(booking.serviceId);
    const payment = await this.getPaymentByBookingId(booking.id);
    const review = await this.getReviewByBookingId(booking.id);
    
    if (!customer || !provider || !providerProfile || !service) return undefined;
    
    return {
      ...booking,
      customer,
      provider: { ...provider, providerProfile },
      service,
      payment,
      review
    };
  }
  
  async getBookingsByCustomerId(customerId) {
    return Array.from(this.bookings.values()).filter(booking => booking.customerId === customerId);
  }
  
  async getBookingsByProviderId(providerId) {
    return Array.from(this.bookings.values()).filter(booking => booking.providerId === providerId);
  }
  
  async createBooking(booking) {
    const id = this.bookingId++;
    const newBooking = { 
      ...booking, 
      id,
      status: booking.status || "requested",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async updateBookingStatus(id, status) {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { 
      ...booking, 
      status,
      updatedAt: new Date()
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Payment operations
  async getPayment(id) {
    return this.payments.get(id);
  }
  
  async getPaymentByBookingId(bookingId) {
    return Array.from(this.payments.values()).find(payment => payment.bookingId === bookingId);
  }
  
  async createPayment(payment) {
    const id = this.paymentId++;
    const newPayment = { 
      ...payment, 
      id,
      status: payment.status || "pending",
      createdAt: new Date()
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }
  
  async updatePayment(id, paymentData) {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Review operations
  async getReview(id) {
    return this.reviews.get(id);
  }
  
  async getReviewByBookingId(bookingId) {
    return Array.from(this.reviews.values()).find(review => review.bookingId === bookingId);
  }
  
  async getReviewsByProviderId(providerId) {
    return Array.from(this.reviews.values()).filter(review => review.providerId === providerId);
  }
  
  async createReview(review) {
    const id = this.reviewId++;
    const newReview = { 
      ...review, 
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export const storage = new MemStorage();