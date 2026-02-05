"use server";

import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";

import { requireMember } from "@/auth/require";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";

export async function bookSpot(formData: FormData) {
  const member = await requireMember();

  const slotId = String(formData.get("slotId") ?? "");
  const date = String(formData.get("date") ?? "");
  if (!slotId) throw new Error("slotId is required");

  const db = getDb();

  try {
    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(and(eq(bookings.slotId, slotId), eq(bookings.memberId, member.id), eq(bookings.status, "booked")))
        .limit(1);
      if (existing.length > 0) throw new Error("ALREADY_BOOKED");

      const pick = await tx.execute<{ spot_no: number }>(sql`
        select spot_no
        from tee_time_spots
        where slot_id = ${slotId} and booked_by_member_id is null
        order by spot_no
        for update skip locked
        limit 1
      `);

      const spotNo = pick.rows[0]?.spot_no;
      if (!spotNo) throw new Error("FULL");

      const updated = await tx.execute<{ spot_no: number }>(sql`
        update tee_time_spots
        set booked_by_member_id = ${member.id}, booked_at = now()
        where slot_id = ${slotId} and spot_no = ${spotNo} and booked_by_member_id is null
        returning spot_no
      `);
      if (updated.rows.length === 0) throw new Error("FULL");

      await tx.insert(bookings).values({
        slotId,
        spotNo,
        memberId: member.id,
      });
    });

    redirect(date ? `/tee-sheet?date=${encodeURIComponent(date)}` : "/tee-sheet");
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN";
    const error =
      code === "FULL" ? "full" : code === "ALREADY_BOOKED" ? "already_booked" : "error";

    redirect(
      date
        ? `/tee-sheet?date=${encodeURIComponent(date)}&error=${encodeURIComponent(error)}`
        : `/tee-sheet?error=${encodeURIComponent(error)}`,
    );
  }
}
