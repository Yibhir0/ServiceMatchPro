import { 
  users, services, providerProfiles, credentials, bookings, payments, reviews,
  User, Service, ProviderProfile, Credential, Booking, Payment, Review,
  InsertUser, InsertService, InsertProviderProfile, InsertCredential, InsertBooking, InsertPayment, InsertReview,
  ProviderWithProfile, BookingWithDetails
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { and, desc, eq, like, or } from "drizzle-orm";
import { Pool } from '@neondatabase/serverless';

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private providerProfiles: Map<number, ProviderProfile>;
  private credentials: Map<number, Credential>;
  private bookings: Map<number, Booking>;
  private payments: Map<number, Payment>;
  private reviews: Map<number, Review>;
  
  sessionStore: session.SessionStore;
  
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
    
    // Initialize with default services
    this.initializeServices();
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
    const newUser = { ...user, id };
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
    const newProfile = { ...profile, id };
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
    const newCredential = { 
      ...credential, 
      id, 
      submittedAt: new Date(),
      isVerified: false,
      verifiedAt: null
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
    const newPayment = { 
      ...payment, 
      id, 
      status: "pending" as const, 
      createdAt: new Date() 
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
    const newReview = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize default services
    this.initializeServices();
  }

  private async initializeServices() {
    try {
      const existingServices = await this.getServices();
      
      // Only seed services if none exist
      if (existingServices.length === 0) {
        const defaultServices = [
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
        
        for (const service of defaultServices) {
          await this.createService(service as InsertService);
        }
      }
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return db.select().from(services).where(eq(services.category, category));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  // Provider profile operations
  async getProviderProfile(id: number): Promise<ProviderProfile | undefined> {
    const [profile] = await db.select().from(providerProfiles).where(eq(providerProfiles.id, id));
    return profile;
  }

  async getProviderProfileByUserId(userId: number): Promise<ProviderProfile | undefined> {
    const [profile] = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, userId));
    return profile;
  }

  async getProvidersByCategory(category: string): Promise<ProviderWithProfile[]> {
    const result = await db.select()
      .from(users)
      .innerJoin(providerProfiles, eq(users.id, providerProfiles.userId))
      .where(and(
        eq(users.role, 'provider'),
        eq(providerProfiles.category, category)
      ));
    
    return result.map(({ users: user, provider_profiles: profile }) => ({ 
      ...user, 
      providerProfile: profile 
    }));
  }

  async getProvidersByCity(city: string): Promise<ProviderWithProfile[]> {
    const result = await db.select()
      .from(users)
      .innerJoin(providerProfiles, eq(users.id, providerProfiles.userId))
      .where(and(
        eq(users.role, 'provider'),
        eq(users.city, city)
      ));
    
    return result.map(({ users: user, provider_profiles: profile }) => ({ 
      ...user, 
      providerProfile: profile 
    }));
  }

  async getProvidersBySearch(query: { category?: string, city?: string }): Promise<ProviderWithProfile[]> {
    let conditions = [eq(users.role, 'provider')];
    
    if (query.category) {
      conditions.push(eq(providerProfiles.category, query.category));
    }
    
    if (query.city) {
      conditions.push(like(users.city, `%${query.city}%`));
    }
    
    const result = await db.select()
      .from(users)
      .innerJoin(providerProfiles, eq(users.id, providerProfiles.userId))
      .where(and(...conditions));
    
    return result.map(({ users: user, provider_profiles: profile }) => ({ 
      ...user, 
      providerProfile: profile 
    }));
  }

  async createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile> {
    // First update the user role to provider
    await this.updateUser(profile.userId, { role: 'provider' });
    
    // Then create the provider profile
    const [newProfile] = await db.insert(providerProfiles).values(profile).returning();
    return newProfile;
  }

  async updateProviderProfile(id: number, profileData: Partial<ProviderProfile>): Promise<ProviderProfile | undefined> {
    const [updatedProfile] = await db
      .update(providerProfiles)
      .set(profileData)
      .where(eq(providerProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  // Credential operations
  async getCredentials(providerId: number): Promise<Credential[]> {
    return db.select().from(credentials).where(eq(credentials.providerId, providerId));
  }

  async createCredential(credential: InsertCredential): Promise<Credential> {
    const [newCredential] = await db
      .insert(credentials)
      .values({
        ...credential,
        isVerified: false,
      })
      .returning();
    return newCredential;
  }

  async updateCredential(id: number, credentialData: Partial<Credential>): Promise<Credential | undefined> {
    // If setting isVerified to true, also set verifiedAt
    if (credentialData.isVerified) {
      credentialData.verifiedAt = new Date();
    }
    
    const [updatedCredential] = await db
      .update(credentials)
      .set(credentialData)
      .where(eq(credentials.id, id))
      .returning();
    return updatedCredential;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingWithDetails(id: number): Promise<BookingWithDetails | undefined> {
    // Get the basic booking
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    // Get all the related entities
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
    return db.select().from(bookings).where(eq(bookings.customerId, customerId));
  }

  async getBookingsByProviderId(providerId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.providerId, providerId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values({
        ...booking,
        status: "requested",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentByBookingId(bookingId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.bookingId, bookingId));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values({
        ...payment,
        status: "pending",
        createdAt: new Date()
      })
      .returning();
    return newPayment;
  }

  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewByBookingId(bookingId: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId));
    return review;
  }

  async getReviewsByProviderId(providerId: number): Promise<Review[]> {
    // First get all bookings for this provider
    const providerBookings = await this.getBookingsByProviderId(providerId);
    const bookingIds = providerBookings.map(booking => booking.id);
    
    if (bookingIds.length === 0) return [];
    
    // Then get all reviews for those bookings
    return db.select()
      .from(reviews)
      .where(
        bookingIds.map(id => eq(reviews.bookingId, id)).reduce((acc, curr) => or(acc, curr))
      );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values({
        ...review,
        createdAt: new Date()
      })
      .returning();
    return newReview;
  }
}

// Use the DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
