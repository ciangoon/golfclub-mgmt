"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { and, eq, isNotNull } from "drizzle-orm";

import { getDb } from "@/db";
import { members } from "@/db/schema";
import { createSession, clearSession } from "@/auth/session";

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function memberLogin(formData: FormData) {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!username || !password) redirect("/login?error=invalid");

  const db = getDb();
  const rows = await db
    .select({
      id: members.id,
      passwordHash: members.passwordHash,
    })
    .from(members)
    .where(and(eq(members.username, username), isNotNull(members.passwordHash)))
    .limit(1);

  const row = rows[0];
  if (!row?.passwordHash) redirect("/login?error=invalid");

  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) redirect("/login?error=invalid");

  await createSession(row.id);
  redirect("/tee-sheet");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
