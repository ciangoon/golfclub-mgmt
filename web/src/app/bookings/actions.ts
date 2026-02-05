"use server";

import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";

import { requireMember } from "@/auth/require";
import { getDb } from "@/db";
import { bookings, teeTimeSpots } from "@/db/schema";

export async function cancelBooking(formData: FormData) {
  const member = await requireMember();
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) throw new Error("bookingId is required");

  const db = getDb();

  await db.transaction(async (tx) => {
    const rows = await tx
      .select({
        id: bookings.id,
        slotId: bookings.slotId,
        spotNo: bookings.spotNo,
      })
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.memberId, member.id), eq(bookings.status, "booked")))
      .limit(1);

    const b = rows[0];
    if (!b) return;

    await tx
      .update(bookings)
      .set({ status: "cancelled", cancelledAt: sql`now()` })
      .where(eq(bookings.id, b.id));

    await tx
      .update(teeTimeSpots)
      .set({ bookedByMemberId: null, bookedAt: null })
      .where(and(eq(teeTimeSpots.slotId, b.slotId), eq(teeTimeSpots.spotNo, b.spotNo)));
  });

  redirect("/bookings");
}

