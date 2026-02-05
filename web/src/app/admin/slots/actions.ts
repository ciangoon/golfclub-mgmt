"use server";

import { redirect } from "next/navigation";
import { and, eq, gte, lt } from "drizzle-orm";

import { requireAdmin } from "@/auth/require";
import { getDb } from "@/db";
import { teeTimeSlots, teeTimeSpots } from "@/db/schema";

function parseDateParam(date: string) {
  // date is expected as YYYY-MM-DD
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
  return d;
}

function buildTeeTimesForDay(date: string) {
  // Prototype: interpret as server-local time for now.
  const dayStart = new Date(`${date}T07:00:00`);
  const dayEnd = new Date(`${date}T14:00:00`);
  const times: Date[] = [];
  for (let t = new Date(dayStart); t <= dayEnd; t = new Date(t.getTime() + 20 * 60 * 1000)) {
    times.push(t);
  }
  return times;
}

export async function generateTeeSheet(formData: FormData) {
  await requireAdmin();

  const course = String(formData.get("course") ?? "Main Course").trim() || "Main Course";
  const capacity = Number(formData.get("capacity") ?? 4);
  const date = String(formData.get("date") ?? "");
  if (!date) throw new Error("date is required");
  if (!Number.isFinite(capacity) || capacity <= 0 || capacity > 8) throw new Error("Invalid capacity");

  const db = getDb();

  await db.transaction(async (tx) => {
    const times = buildTeeTimesForDay(date);
    const inserted = await tx
      .insert(teeTimeSlots)
      .values(
        times.map((startsAt) => ({
          course,
          startsAt,
          capacity,
        })),
      )
      .onConflictDoNothing({
        target: [teeTimeSlots.course, teeTimeSlots.startsAt],
      })
      .returning();

    if (inserted.length > 0) {
      const spots = inserted.flatMap((slot) =>
        Array.from({ length: capacity }, (_, i) => ({
          slotId: slot.id,
          spotNo: i + 1,
        })),
      );
      await tx.insert(teeTimeSpots).values(spots);
    }
  });

  redirect(date ? `/admin/slots?date=${encodeURIComponent(date)}` : "/admin/slots");
}

export async function resetTeeSheet(formData: FormData) {
  await requireAdmin();

  const course = String(formData.get("course") ?? "Main Course").trim() || "Main Course";
  const date = String(formData.get("date") ?? "");
  if (!date) throw new Error("date is required");

  const start = parseDateParam(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const db = getDb();
  await db
    .delete(teeTimeSlots)
    .where(and(eq(teeTimeSlots.course, course), gte(teeTimeSlots.startsAt, start), lt(teeTimeSlots.startsAt, end)));

  redirect(`/admin/slots?date=${encodeURIComponent(date)}`);
}

export async function deleteSlot(formData: FormData) {
  await requireAdmin();

  const slotId = String(formData.get("slotId") ?? "");
  const date = String(formData.get("date") ?? "");
  if (!slotId) throw new Error("slotId is required");

  const db = getDb();
  await db.delete(teeTimeSlots).where(eq(teeTimeSlots.id, slotId));

  redirect(date ? `/admin/slots?date=${encodeURIComponent(date)}` : "/admin/slots");
}

