import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["customer", "provider", "admin"] }).notNull().default("customer"),
  name: text("name").notNull(),
  city: text("city"),
  phone: text("phone"),
  bio: text("bio"),
  profileImage: text("profile_image"),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category", { enum: ["plumbing", "electrical", "landscaping"] }).notNull(),
});

export const providerProfiles = pgTable("provider_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  hourlyRate: real("hourly_rate").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  category: text("category", { enum: ["plumbing", "electrical", "landscaping"] }).notNull(),
  workImages: json("work_images").$type<string[]>(),
  yearsOfExperience: integer("years_of_experience"),
});

export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providerProfiles.id),
  documentName: text("document_name").notNull(),
  documentUrl: text("document_url").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  verifiedAt: timestamp("verified_at"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  status: text("status", { enum: ["requested", "accepted", "completed", "approved", "rejected", "cancelled"] }).notNull().default("requested"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  amount: real("amount").notNull(),
  status: text("status", { enum: ["pending", "completed", "failed", "refunded"] }).notNull().default("pending"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertProviderProfileSchema = createInsertSchema(providerProfiles).omit({ id: true });
export const insertCredentialSchema = createInsertSchema(credentials).omit({ id: true, submittedAt: true, verifiedAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, status: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, status: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertProviderProfile = z.infer<typeof insertProviderProfileSchema>;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type Credential = typeof credentials.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Review = typeof reviews.$inferSelect;

// Extended types
export type UserWithRole = User & {
  role: "customer" | "provider" | "admin";
};

export type ProviderWithProfile = User & {
  providerProfile: ProviderProfile;
};

export type BookingWithDetails = Booking & {
  customer: User;
  provider: ProviderWithProfile;
  service: Service;
  payment?: Payment;
  review?: Review;
};
