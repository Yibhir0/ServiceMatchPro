import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["customer", "provider", "admin"] }).notNull().default("customer"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
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
  city: text("city").notNull(),
  bio: text("bio").notNull(),
  rating: real("rating").default(0),
  workImages: json("work_images").$type(),
  yearsOfExperience: integer("years_of_experience"),
});

export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providerProfiles.id),
  type: text("type", { enum: ["license", "certification", "insurance", "background_check"] }).notNull(),
  number: text("number").notNull(),
  description: text("description").notNull(),
  issuedBy: text("issued_by").notNull(),
  expiresAt: timestamp("expires_at"),
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
  paymentMethod: text("payment_method", { enum: ["credit_card", "debit_card", "paypal", "cash"] }),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
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