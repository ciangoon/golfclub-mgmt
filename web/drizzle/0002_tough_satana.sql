ALTER TABLE "members" ADD COLUMN "username" text;--> statement-breakpoint
CREATE UNIQUE INDEX "members_username_unique" ON "members" USING btree ("username");