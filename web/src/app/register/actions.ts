"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { members } from "@/db/schema";
import { createSession } from "@/auth/session";

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function registerMember(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!name) redirect("/register?error=name");
  if (username.length < 3) redirect("/register?error=username");
  if (password.length < 6) redirect("/register?error=password");

  const db = getDb();

  const existing = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.username, username))
    .limit(1);
  if (existing.length > 0) redirect("/register?error=exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const [row] = await db
    .insert(members)
    .values({
      name,
      username,
      passwordHash,
      isAdmin: false,
    })
    .returning();

  await createSession(row.id);
  redirect("/tee-sheet");
}

