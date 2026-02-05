import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";

const ADMIN_COOKIE_NAME = "gc_admin";

function getAdminUsername() {
  const u = process.env.ADMIN_USERNAME;
  if (!u) throw new Error("ADMIN_USERNAME is not set");
  return u;
}

function getAdminPassword() {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD is not set");
  return p;
}

function getAdminCookieSecret() {
  return process.env.ADMIN_COOKIE_SECRET || process.env.SESSION_COOKIE_SECRET || "";
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function signSessionId(sessionId: string) {
  const secret = getAdminCookieSecret();
  if (!secret) throw new Error("ADMIN_COOKIE_SECRET (or SESSION_COOKIE_SECRET) is not set");
  const sig = crypto.createHmac("sha256", secret).update(sessionId).digest("base64url");
  return `${sessionId}.${sig}`;
}

function verifySignedValue(value: string) {
  const [sessionId, sig] = value.split(".");
  if (!sessionId || !sig) return null;

  const secret = getAdminCookieSecret();
  if (!secret) return null;

  const expected = crypto.createHmac("sha256", secret).update(sessionId).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  return sessionId;
}

export async function createAdminSession(input: { username: string; password: string }) {
  // Constant-time compare on values we control.
  const okUser = safeEqual(input.username, getAdminUsername());
  const okPass = safeEqual(input.password, getAdminPassword());
  if (!okUser || !okPass) return { ok: false as const };

  const db = getDb();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [row] = await db
    .insert(adminSessions)
    .values({ username: input.username, expiresAt })
    .returning();

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: signSessionId(row.id),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: row.expiresAt,
  });

  return { ok: true as const };
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (raw) {
    const id = verifySignedValue(raw);
    if (id) {
      const db = getDb();
      await db.delete(adminSessions).where(eq(adminSessions.id, id));
    }
  }

  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function isAdminAuthed() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!raw) return false;

  const id = verifySignedValue(raw);
  if (!id) return false;

  const db = getDb();
  const now = new Date();
  const rows = await db
    .select({ id: adminSessions.id })
    .from(adminSessions)
    .where(and(eq(adminSessions.id, id), gt(adminSessions.expiresAt, now)))
    .limit(1);

  return rows.length > 0;
}

