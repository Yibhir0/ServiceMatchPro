// Simple in-memory storage implementation

class MemStorage {
  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.providerProfiles = new Map();
    this.credentials = new Map();
    this.bookings = new Map();
    this.payments = new Map();
    this.reviews = new Map();
    
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
      { id: this.serviceId++, name: 'Plumbing', description: 'Plumbing services', category: 'plumbing' },
      { id: this.serviceId++, name: 'Electrical', description: 'Electrical services', category: 'electrical' },
      { id: this.serviceId++, name: 'Cleaning', description: 'Cleaning services', category: 'cleaning' },
      { id: this.serviceId++, name: 'Landscaping', description: 'Landscaping services', category: 'landscaping' },
      { id: this.serviceId++, name: 'Painting', description: 'Painting services', category: 'painting' },
      { id: this.serviceId++, name: 'Carpentry', description: 'Carpentry services', category: 'carpentry' },
      { id: this.serviceId++, name: 'HVAC', description: 'HVAC services', category: 'hvac' },
      { id: this.serviceId++, name: 'Moving', description: 'Moving services', category: 'moving' }
    ];

    services.forEach(service => {
      this.services.set(service.id, service);
    });
  }

  async initializeUsers() {
    // Sample users: customer, service provider, and admin
    const hashedPassword = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.salt"; // For demonstration, in reality this would be properly hashed
    
    const users = [
      { 
        id: this.userId++, 
        username: 'sarahsmith', 
        password: hashedPassword, 
        email: 'sarah.smith@example.com', 
        fullName: 'Sarah Smith',
        role: 'customer',
        createdAt: new Date().toISOString()
      },
      { 
        id: this.userId++, 
        username: 'johnplumber', 
        password: hashedPassword, 
        email: 'john.plumber@example.com', 
        fullName: 'John Doe',
        role: 'provider',
        createdAt: new Date().toISOString()
      },
      { 
        id: this.userId++, 
        username: 'admin', 
        password: hashedPassword, 
        email: 'admin@example.com', 
        fullName: 'System Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];

    users.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  async initializeProviderProfiles() {
    // Get the provider user
    const providerUser = Array.from(this.users.values()).find(user => user.role === 'provider');
    
    if (providerUser) {
      const providerProfile = {
        id: this.providerProfileId++,
        userId: providerUser.id,
        serviceId: 1, // Plumbing
        companyName: 'Quality Plumbing Services',
        description: 'Professional plumbing services with over 10 years of experience',
        hourlyRate: 75,
        city: 'New York',
        state: 'NY',
        availability: 'Weekdays 8AM-6PM, Weekends by appointment',
        phone: '123-456-7890',
        averageRating: 4.8,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.providerProfiles.set(providerProfile.id, providerProfile);
    }
  }

  async initializeCredentials() {
    // Get provider profile
    const providerProfile = Array.from(this.providerProfiles.values())[0];
    
    if (providerProfile) {
      const credential = {
        id: this.credentialId++,
        providerId: providerProfile.id,
        type: 'license',
        licenseNumber: 'LIC12345',
        issuingAuthority: 'New York State Plumbing Board',
        issueDate: '2018-01-15',
        expiryDate: '2025-01-14',
        verificationStatus: 'verified',
        submittedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString()
      };

      this.credentials.set(credential.id, credential);
    }
  }

  async initializeBookings() {
    // Get the customer user
    const customerUser = Array.from(this.users.values()).find(user => user.role === 'customer');
    
    // Get the provider profile
    const providerProfile = Array.from(this.providerProfiles.values())[0];
    
    if (customerUser && providerProfile) {
      // Sample booking
      const booking = {
        id: this.bookingId++,
        customerId: customerUser.id,
        providerId: providerProfile.id,
        serviceId: providerProfile.serviceId,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        scheduledTime: '10:00 AM',
        duration: 2, // hours
        address: '123 Main St, New York, NY',
        description: 'Leaking kitchen sink needs repair',
        status: 'pending',
        totalAmount: 150, // 2 hours at $75/hour
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.bookings.set(booking.id, booking);
      
      // Sample completed booking with payment and review
      const completedBooking = {
        id: this.bookingId++,
        customerId: customerUser.id,
        providerId: providerProfile.id,
        serviceId: providerProfile.serviceId,
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        scheduledTime: '2:00 PM',
        duration: 1, // hour
        address: '123 Main St, New York, NY',
        description: 'Bathroom sink installation',
        status: 'completed',
        totalAmount: 75, // 1 hour at $75/hour
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.bookings.set(completedBooking.id, completedBooking);

      // Add payment for completed booking
      const payment = {
        id: this.paymentId++,
        bookingId: completedBooking.id,
        amount: completedBooking.totalAmount,
        paymentMethod: 'credit_card',
        status: 'completed',
        transactionId: 'mock-transaction-' + Math.floor(Math.random() * 1000000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.payments.set(payment.id, payment);

      // Add review for completed booking
      const review = {
        id: this.reviewId++,
        bookingId: completedBooking.id,
        providerId: providerProfile.id,
        customerId: customerUser.id,
        rating: 5,
        comment: 'Excellent service! Professional, on time, and did a great job installing the sink.',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.reviews.set(review.id, review);
    }
  }

  // User related methods
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData) {
    const id = this.userId++;
    const now = new Date().toISOString();
    const user = {
      id,
      ...userData,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, userData) {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Service related methods
  async getService(id) {
    return this.services.get(id);
  }

  async getServices() {
    return Array.from(this.services.values());
  }

  async getServicesByCategory(category) {
    return Array.from(this.services.values()).filter(
      service => service.category === category
    );
  }

  async createService(service) {
    const id = this.serviceId++;
    const newService = { id, ...service };
    this.services.set(id, newService);
    return newService;
  }

  // Provider profile related methods
  async getProviderProfile(id) {
    return this.providerProfiles.get(id);
  }

  async getProviderProfileByUserId(userId) {
    return Array.from(this.providerProfiles.values()).find(
      profile => profile.userId === userId
    );
  }

  async getProvidersByCategory(category) {
    // Get services by category
    const services = await this.getServicesByCategory(category);
    if (!services.length) return [];
    
    // Get provider profiles by service ids
    return Array.from(this.providerProfiles.values()).filter(
      profile => services.some(service => service.id === profile.serviceId)
    );
  }

  async getProvidersByCity(city) {
    return Array.from(this.providerProfiles.values()).filter(
      profile => profile.city.toLowerCase() === city.toLowerCase()
    );
  }

  async getProvidersBySearch(query) {
    query = query.toLowerCase();
    return Array.from(this.providerProfiles.values()).filter(profile => {
      const service = this.services.get(profile.serviceId);
      return (
        (profile.companyName && profile.companyName.toLowerCase().includes(query)) ||
        (profile.description && profile.description.toLowerCase().includes(query)) ||
        (profile.city && profile.city.toLowerCase().includes(query)) ||
        (service && service.name.toLowerCase().includes(query)) ||
        (service && service.category.toLowerCase().includes(query))
      );
    });
  }

  async createProviderProfile(profile) {
    const id = this.providerProfileId++;
    const now = new Date().toISOString();
    const newProfile = { 
      id, 
      ...profile,
      createdAt: now,
      updatedAt: now,
      averageRating: 0,
      isVerified: false
    };
    this.providerProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateProviderProfile(id, profileData) {
    const profile = await this.getProviderProfile(id);
    if (!profile) {
      throw new Error('Provider profile not found');
    }
    const now = new Date().toISOString();
    const updatedProfile = { 
      ...profile, 
      ...profileData,
      updatedAt: now
    };
    this.providerProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Credentials related methods
  async getCredentials(providerId) {
    return Array.from(this.credentials.values()).filter(
      credential => credential.providerId === providerId
    );
  }

  async createCredential(credential) {
    const id = this.credentialId++;
    const now = new Date().toISOString();
    const newCredential = { 
      id, 
      ...credential,
      submittedAt: now,
      verificationStatus: 'pending'
    };
    this.credentials.set(id, newCredential);
    return newCredential;
  }

  async updateCredential(id, credentialData) {
    const credential = this.credentials.get(id);
    if (!credential) {
      throw new Error('Credential not found');
    }
    const updatedCredential = { ...credential, ...credentialData };
    this.credentials.set(id, updatedCredential);
    return updatedCredential;
  }

  // Booking related methods
  async getBooking(id) {
    return this.bookings.get(id);
  }

  async getBookingWithDetails(id) {
    const booking = await this.getBooking(id);
    if (!booking) return null;
    
    const customer = await this.getUser(booking.customerId);
    const provider = await this.getProviderProfile(booking.providerId);
    const service = await this.getService(booking.serviceId);
    const payment = await this.getPaymentByBookingId(booking.id);
    const review = await this.getReviewByBookingId(booking.id);
    
    return {
      ...booking,
      customer: customer ? { 
        id: customer.id, 
        username: customer.username,
        fullName: customer.fullName,
        email: customer.email
      } : null,
      provider: provider ? {
        id: provider.id,
        companyName: provider.companyName,
        hourlyRate: provider.hourlyRate
      } : null,
      service: service ? {
        id: service.id,
        name: service.name,
        category: service.category
      } : null,
      payment,
      review
    };
  }

  async getBookingsByCustomerId(customerId) {
    const bookings = Array.from(this.bookings.values()).filter(
      booking => booking.customerId === customerId
    );
    
    // Sort by scheduledDate (descending)
    return bookings.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  }

  async getBookingsByProviderId(providerId) {
    const bookings = Array.from(this.bookings.values()).filter(
      booking => booking.providerId === providerId
    );
    
    // Sort by scheduledDate (descending)
    return bookings.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  }

  async createBooking(booking) {
    const id = this.bookingId++;
    const now = new Date().toISOString();
    const newBooking = { 
      id, 
      ...booking,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id, status) {
    const booking = await this.getBooking(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    const now = new Date().toISOString();
    const updatedBooking = { 
      ...booking, 
      status,
      updatedAt: now
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Payment related methods
  async getPayment(id) {
    return this.payments.get(id);
  }

  async getPaymentByBookingId(bookingId) {
    return Array.from(this.payments.values()).find(
      payment => payment.bookingId === bookingId
    );
  }

  async createPayment(payment) {
    const id = this.paymentId++;
    const now = new Date().toISOString();
    const newPayment = { 
      id, 
      ...payment,
      createdAt: now
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id, paymentData) {
    const payment = await this.getPayment(id);
    if (!payment) {
      throw new Error('Payment not found');
    }
    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Review related methods
  async getReview(id) {
    return this.reviews.get(id);
  }

  async getReviewByBookingId(bookingId) {
    return Array.from(this.reviews.values()).find(
      review => review.bookingId === bookingId
    );
  }

  async getReviewsByProviderId(providerId) {
    return Array.from(this.reviews.values()).filter(
      review => review.providerId === providerId
    );
  }

  async createReview(review) {
    const id = this.reviewId++;
    const now = new Date().toISOString();
    const newReview = { 
      id, 
      ...review,
      createdAt: now
    };
    this.reviews.set(id, newReview);
    
    // Update provider's average rating
    this.updateProviderRating(review.providerId);
    
    return newReview;
  }
  
  async updateProviderRating(providerId) {
    const reviews = await this.getReviewsByProviderId(providerId);
    if (!reviews.length) return;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const provider = await this.getProviderProfile(providerId);
    if (provider) {
      await this.updateProviderProfile(providerId, { averageRating });
    }
  }
}

// Create and export a singleton instance
const storage = new MemStorage();

module.exports = { storage };