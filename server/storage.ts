import { 
  users, services, providerProfiles, credentials, bookings, payments, reviews,
  User, Service, ProviderProfile, Credential, Booking, Payment, Review,
  InsertUser, InsertService, InsertProviderProfile, InsertCredential, InsertBooking, InsertPayment, InsertReview,
  ProviderWithProfile, BookingWithDetails
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

type SessionStore = ReturnType<typeof createMemoryStore>;
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Provider profile operations
  getProviderProfile(id: number): Promise<ProviderProfile | undefined>;
  getProviderProfileByUserId(userId: number): Promise<ProviderProfile | undefined>;
  getProvidersByCategory(category: string): Promise<ProviderWithProfile[]>;
  getProvidersByCity(city: string): Promise<ProviderWithProfile[]>;
  getProvidersBySearch(query: { category?: string, city?: string }): Promise<ProviderWithProfile[]>;
  createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile>;
  updateProviderProfile(id: number, profile: Partial<ProviderProfile>): Promise<ProviderProfile | undefined>;
  
  // Credential operations
  getCredentials(providerId: number): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  updateCredential(id: number, credential: Partial<Credential>): Promise<Credential | undefined>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingWithDetails(id: number): Promise<BookingWithDetails | undefined>;
  getBookingsByCustomerId(customerId: number): Promise<Booking[]>;
  getBookingsByProviderId(providerId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByBookingId(bookingId: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewByBookingId(bookingId: number): Promise<Review | undefined>;
  getReviewsByProviderId(providerId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private providerProfiles: Map<number, ProviderProfile>;
  private credentials: Map<number, Credential>;
  private bookings: Map<number, Booking>;
  private payments: Map<number, Payment>;
  private reviews: Map<number, Review>;
  
  sessionStore: SessionStore;
  
  private userId: number = 1;
  private serviceId: number = 1;
  private providerProfileId: number = 1;
  private credentialId: number = 1;
  private bookingId: number = 1;
  private paymentId: number = 1;
  private reviewId: number = 1;
  
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
    
    // Initialize sample data
    this.initializeData();
  }
  
  private async initializeData() {
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
  
  private initializeServices() {
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
      this.createService(service as InsertService);
    });
  }
  
  private async initializeUsers() {
    // Create admin user
    await this.createUser({
      username: "admin",
      password: "admin123", // This would be hashed in a real scenario
      email: "admin@homeservices.com",
      firstName: "Admin",
      lastName: "User",
      phone: "555-0000",
      role: "admin" as const,
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
        role: "provider" as const,
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
        role: "provider" as const,
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
        role: "provider" as const,
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
        role: "customer" as const,
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
        role: "customer" as const,
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
        role: "customer" as const,
        city: "Los Angeles",
        bio: null,
        profileImage: null
      }
    ];
    
    for (const customer of customers) {
      await this.createUser(customer);
    }
  }
  
  private async initializeProviderProfiles() {
    // Find provider users
    const allUsers = Array.from(this.users.values());
    const providerUsers = allUsers.filter(user => user.role === "provider");
    
    // Create provider profiles
    const profiles = [
      {
        userId: providerUsers[0].id,
        bio: "Professional plumber with over 15 years of experience. Specializing in residential plumbing repairs and installations.",
        category: "plumbing" as const,
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
        category: "electrical" as const,
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
        category: "landscaping" as const,
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
  
  private async initializeCredentials() {
    // Find provider profiles
    const profiles = Array.from(this.providerProfiles.values());
    
    // Create credentials for each provider
    for (const profile of profiles) {
      await this.createCredential({
        providerId: profile.id,
        type: "license" as const,
        number: `LIC-${Math.floor(1000 + Math.random() * 9000)}`,
        description: "Professional license",
        issuedBy: "State Board",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      });
      
      await this.createCredential({
        providerId: profile.id,
        type: "insurance" as const,
        number: `INS-${Math.floor(1000 + Math.random() * 9000)}`,
        description: "Liability insurance",
        issuedBy: "Insurance Co.",
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months from now
      });
    }
  }
  
  private async initializeBookings() {
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
        status: "requested" as const,
        description: "Need to fix a leaky faucet in the kitchen."
      },
      {
        customerId: customers[1].id,
        providerId: providerProfiles[1].userId,
        serviceId: services.find(s => s.category === "electrical")?.id || 4,
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        address: "456 Oak Ave",
        city: "Chicago",
        status: "accepted" as const,
        description: "Need to install new lighting fixtures in the living room."
      },
      {
        customerId: customers[2].id,
        providerId: providerProfiles[2].userId,
        serviceId: services.find(s => s.category === "landscaping")?.id || 7,
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        address: "789 Pine Blvd",
        city: "Los Angeles",
        status: "completed" as const,
        description: "Need lawn maintenance and garden cleanup."
      }
    ];
    
    for (const booking of bookings) {
      const createdBooking = await this.createBooking(booking as InsertBooking);
      
      // For completed booking, create payment and review
      if (booking.status === "completed") {
        const payment = await this.createPayment({
          bookingId: createdBooking.id,
          amount: (providerProfiles.find(p => p.id === booking.providerId)?.hourlyRate || 75) * 2, // 2 hours of work
          paymentMethod: "credit_card" as const,
          transactionId: `TR-${Math.floor(1000 + Math.random() * 9000)}`
        });
        
        await this.createReview({
          bookingId: createdBooking.id,
          providerId: booking.providerId,
          customerId: booking.customerId,
          rating: 5,
          comment: "Excellent service! Very professional and thorough."
        } as InsertReview);
      }
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
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
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.category === category);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const newService = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }
  
  // Provider profile operations
  async getProviderProfile(id: number): Promise<ProviderProfile | undefined> {
    return this.providerProfiles.get(id);
  }
  
  async getProviderProfileByUserId(userId: number): Promise<ProviderProfile | undefined> {
    return Array.from(this.providerProfiles.values()).find(profile => profile.userId === userId);
  }
  
  async getProvidersByCategory(category: string): Promise<ProviderWithProfile[]> {
    const providers: ProviderWithProfile[] = [];
    
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
  
  async getProvidersByCity(city: string): Promise<ProviderWithProfile[]> {
    const providers: ProviderWithProfile[] = [];
    
    for (const user of this.users.values()) {
      if (user.role === "provider" && user.city?.toLowerCase() === city.toLowerCase()) {
        const profile = await this.getProviderProfileByUserId(user.id);
        if (profile) {
          providers.push({ ...user, providerProfile: profile });
        }
      }
    }
    
    return providers;
  }
  
  async getProvidersBySearch(query: { category?: string, city?: string }): Promise<ProviderWithProfile[]> {
    let providers = Array.from(this.users.values())
      .filter(user => user.role === "provider")
      .map(async (user) => {
        const profile = await this.getProviderProfileByUserId(user.id);
        return profile ? { ...user, providerProfile: profile } : null;
      });
    
    const resolvedProviders = (await Promise.all(providers)).filter(Boolean) as ProviderWithProfile[];
    
    if (query.category) {
      resolvedProviders.filter(provider => provider.providerProfile.category === query.category);
    }
    
    if (query.city) {
      resolvedProviders.filter(provider => 
        provider.city?.toLowerCase().includes(query.city!.toLowerCase())
      );
    }
    
    return resolvedProviders;
  }
  
  async createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile> {
    const id = this.providerProfileId++;
    const newProfile: ProviderProfile = { 
      ...profile, 
      id,
      isVerified: profile.isVerified || false,
      rating: profile.rating || null,
      workImages: Array.isArray(profile.workImages) ? profile.workImages : null,
      yearsOfExperience: profile.yearsOfExperience || null
    };
    this.providerProfiles.set(id, newProfile);
    
    // Update user role to provider
    await this.updateUser(profile.userId, { role: "provider" });
    
    return newProfile;
  }
  
  async updateProviderProfile(id: number, profileData: Partial<ProviderProfile>): Promise<ProviderProfile | undefined> {
    const profile = this.providerProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.providerProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // Credential operations
  async getCredentials(providerId: number): Promise<Credential[]> {
    return Array.from(this.credentials.values()).filter(cred => cred.providerId === providerId);
  }
  
  async createCredential(credential: InsertCredential): Promise<Credential> {
    const id = this.credentialId++;
    const newCredential: Credential = { 
      ...credential, 
      id, 
      submittedAt: new Date(),
      isVerified: false,
      verifiedAt: null,
      expiresAt: credential.expiresAt || null
    };
    this.credentials.set(id, newCredential);
    return newCredential;
  }
  
  async updateCredential(id: number, credentialData: Partial<Credential>): Promise<Credential | undefined> {
    const credential = this.credentials.get(id);
    if (!credential) return undefined;
    
    const updatedCredential = { ...credential, ...credentialData };
    if (credentialData.isVerified && !credential.isVerified) {
      updatedCredential.verifiedAt = new Date();
    }
    this.credentials.set(id, updatedCredential);
    return updatedCredential;
  }
  
  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingWithDetails(id: number): Promise<BookingWithDetails | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const customer = await this.getUser(booking.customerId);
    const provider = await this.getUser(booking.providerId);
    const providerProfile = await this.getProviderProfileByUserId(booking.providerId);
    const service = await this.getService(booking.serviceId);
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
  
  async getBookingsByCustomerId(customerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.customerId === customerId);
  }
  
  async getBookingsByProviderId(providerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.providerId === providerId);
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const newBooking = { 
      ...booking, 
      id, 
      status: "requested" as const, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status, updatedAt: new Date() };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentByBookingId(bookingId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.bookingId === bookingId);
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const newPayment: Payment = { 
      ...payment, 
      id, 
      status: "pending" as const, 
      createdAt: new Date(),
      paymentMethod: payment.paymentMethod || null,
      transactionId: payment.transactionId || null
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }
  
  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewByBookingId(bookingId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(review => review.bookingId === bookingId);
  }
  
  async getReviewsByProviderId(providerId: number): Promise<Review[]> {
    const providerBookings = await this.getBookingsByProviderId(providerId);
    const bookingIds = providerBookings.map(booking => booking.id);
    
    return Array.from(this.reviews.values()).filter(review => 
      bookingIds.includes(review.bookingId)
    );
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date(),
      comment: review.comment || null
    };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export const storage = new MemStorage();
