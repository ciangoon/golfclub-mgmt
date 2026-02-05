import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";

import { requireMember } from "@/auth/require";
import { getDb } from "@/db";
import { bookings, teeTimeSlots } from "@/db/schema";

import { cancelBooking } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const member = await requireMember();
  const db = getDb();

  const rows = await db
    .select({
      bookingId: bookings.id,
      slotId: bookings.slotId,
      spotNo: bookings.spotNo,
      course: teeTimeSlots.course,
      startsAt: teeTimeSlots.startsAt,
    })
    .from(bookings)
    .innerJoin(teeTimeSlots, eq(teeTimeSlots.id, bookings.slotId))
    .where(and(eq(bookings.memberId, member.id), eq(bookings.status, "booked")))
    .orderBy(asc(teeTimeSlots.startsAt));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          View your upcoming tee times and cancel if needed.
        </p>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Logged in as <span className="font-medium text-zinc-900 dark:text-zinc-50">{member.name}</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No bookings yet.{" "}
          <Link className="font-medium underline underline-offset-4" href="/tee-sheet">
            Go to tee sheet
          </Link>
          .
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-3xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {rows.map((r) => (
            <li key={r.bookingId} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{r.course}</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {new Date(r.startsAt).toLocaleString()} • Spot {r.spotNo}
                </div>
              </div>

              <form action={cancelBooking}>
                <input type="hidden" name="bookingId" value={r.bookingId} />
                <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                  Cancel
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

