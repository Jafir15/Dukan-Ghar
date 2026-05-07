import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  vehicleName: text("vehicle_name").notNull(),
  vehicleNameUrdu: text("vehicle_name_urdu").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  passengersDetail: text("passengers_detail").notNull(),
  luggageDetail: text("luggage_detail").notNull(),
  pickupAddress: text("pickup_address"),
  dropoffAddress: text("dropoff_address"),
  adminAddress: text("admin_address"),
  agreedRent: numeric("agreed_rent", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
