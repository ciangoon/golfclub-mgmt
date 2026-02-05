import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { members, sessions } from "@/db/schema";

const SESSION_COOKIE_NAME = "gc_session";

function getSessionSecret() {
  const secret = process.env.SESSION_COOKIE_SECRET;
  if (!secret) throw new Error("SESSION_COOKIE_SECRET is not set");
  return secret;
}

function signSessionId(sessionId: string) {
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(sessionId).digest("base64url");
  return `${sessionId}.${sig}`;
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifySignedSessionValue(value: string) {
  const [sessionId, sig] = value.split(".");
  if (!sessionId || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(sessionId)
    .digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  return sessionId;
}

export async function createSession(memberId: string, opts?: { days?: number }) {
  const db = getDb();
  const days = opts?.days ?? 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const [row] = await db
    .insert(sessions)
    .values({ memberId, expiresAt })
    .returning();

  const cookieValue = signSessionId(row.id);
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: row.expiresAt,
  });

  return row;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return;

  const sessionId = verifySignedSessionValue(raw);
  if (sessionId) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentMember() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const sessionId = verifySignedSessionValue(raw);
  if (!sessionId) return null;

  const db = getDb();
  const now = new Date();

  const rows = await db
    .select({
      member: {
        id: members.id,
        name: members.name,
        email: members.email,
        createdAt: members.createdAt,
      },
    })
    .from(sessions)
    .innerJoin(members, eq(sessions.memberId, members.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1);

  return rows[0]?.member ?? null;
}

