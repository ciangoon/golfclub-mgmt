CREATE TYPE "public"."booking_status" AS ENUM('booked', 'cancelled');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid NOT NULL,
	"spot_no" integer NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "booking_status" DEFAULT 'booked' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tee_time_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"capacity" integer DEFAULT 4 NOT NULL,
	"created_by_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tee_time_spots" (
	"slot_id" uuid NOT NULL,
	"spot_no" integer NOT NULL,
	"booked_by_member_id" uuid,
	"booked_at" timestamp with time zone,
	CONSTRAINT "tee_time_spots_slot_id_spot_no_pk" PRIMARY KEY("slot_id","spot_no")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_tee_time_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."tee_time_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tee_time_slots" ADD CONSTRAINT "tee_time_slots_created_by_member_id_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tee_time_spots" ADD CONSTRAINT "tee_time_spots_slot_id_tee_time_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."tee_time_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tee_time_spots" ADD CONSTRAINT "tee_time_spots_booked_by_member_id_members_id_fk" FOREIGN KEY ("booked_by_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_member_id_idx" ON "bookings" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "bookings_slot_id_idx" ON "bookings" USING btree ("slot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_active_slot_spot_unique" ON "bookings" USING btree ("slot_id","spot_no") WHERE "bookings"."status" = 'booked';--> statement-breakpoint
CREATE INDEX "sessions_member_id_idx" ON "sessions" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "tee_time_slots_starts_at_idx" ON "tee_time_slots" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "tee_time_spots_slot_id_idx" ON "tee_time_spots" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "tee_time_spots_booked_by_member_id_idx" ON "tee_time_spots" USING btree ("booked_by_member_id");