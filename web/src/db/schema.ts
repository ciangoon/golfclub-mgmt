import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", ["booked", "cancelled"]);

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    username: text("username"),
    email: text("email"),
    passwordHash: text("password_hash"),
    // Kept for backwards compatibility with initial migration, but NOT used for authorization.
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    usernameUnique: uniqueIndex("members_username_unique").on(t.username),
    emailUnique: uniqueIndex("members_email_unique").on(t.email),
  }),
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    expiresAtIdx: index("admin_sessions_expires_at_idx").on(t.expiresAt),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    memberIdIdx: index("sessions_member_id_idx").on(t.memberId),
    expiresAtIdx: index("sessions_expires_at_idx").on(t.expiresAt),
  }),
);

export const teeTimeSlots = pgTable(
  "tee_time_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    course: text("course").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    capacity: integer("capacity").notNull().default(4),
    createdByMemberId: uuid("created_by_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    startsAtIdx: index("tee_time_slots_starts_at_idx").on(t.startsAt),
    courseStartsAtUnique: uniqueIndex("tee_time_slots_course_starts_at_unique").on(
      t.course,
      t.startsAt,
    ),
  }),
);

export const teeTimeSpots = pgTable(
  "tee_time_spots",
  {
    slotId: uuid("slot_id")
      .notNull()
      .references(() => teeTimeSlots.id, { onDelete: "cascade" }),
    spotNo: integer("spot_no").notNull(),
    bookedByMemberId: uuid("booked_by_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    bookedAt: timestamp("booked_at", { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.slotId, t.spotNo] }),
    slotIdx: index("tee_time_spots_slot_id_idx").on(t.slotId),
    bookedByIdx: index("tee_time_spots_booked_by_member_id_idx").on(t.bookedByMemberId),
  }),
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => teeTimeSlots.id, { onDelete: "cascade" }),
    spotNo: integer("spot_no").notNull(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull().default("booked"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => ({
    memberIdIdx: index("bookings_member_id_idx").on(t.memberId),
    slotIdIdx: index("bookings_slot_id_idx").on(t.slotId),
    activeSlotSpotUnique: uniqueIndex("bookings_active_slot_spot_unique")
      .on(t.slotId, t.spotNo)
      .where(sql`${t.status} = 'booked'`),
  }),
);

export type Member = typeof members.$inferSelect;
export type TeeTimeSlot = typeof teeTimeSlots.$inferSelect;
export type TeeTimeSpot = typeof teeTimeSpots.$inferSelect;
export type Booking = typeof bookings.$inferSelect;

