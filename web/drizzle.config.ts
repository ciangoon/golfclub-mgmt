import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// drizzle-kit does not automatically load Next.js-style `.env.local`.
// Load `.env.local` first, then fall back to `.env`.
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});

