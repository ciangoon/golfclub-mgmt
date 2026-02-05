import { and, asc, eq, gte, lt, sql } from "drizzle-orm";

import { requireAdmin } from "@/auth/require";
import { getDb } from "@/db";
import { teeTimeSlots, teeTimeSpots } from "@/db/schema";

import { deleteSlot, generateTeeSheet, resetTeeSheet } from "./actions";
import { adminLogout } from "../login/actions";

export const dynamic = "force-dynamic";

function formatLocalDateYYYYMMDD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function AdminSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireAdmin();

  const { date: dateParam } = await searchParams;
  const date = dateParam ?? formatLocalDateYYYYMMDD(new Date());

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const db = getDb();
  const slots = await db
    .select({
      id: teeTimeSlots.id,
      course: teeTimeSlots.course,
      startsAt: teeTimeSlots.startsAt,
      capacity: teeTimeSlots.capacity,
      available:
        sql<number>`count(*) filter (where ${teeTimeSpots.bookedByMemberId} is null)`.mapWith(
          Number,
        ),
    })
    .from(teeTimeSlots)
    .leftJoin(teeTimeSpots, eq(teeTimeSpots.slotId, teeTimeSlots.id))
    .where(and(gte(teeTimeSlots.startsAt, start), lt(teeTimeSlots.startsAt, end)))
    .groupBy(teeTimeSlots.id)
    .orderBy(asc(teeTimeSlots.startsAt));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin: tee time slots</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Create and manage tee time slots (the tee sheet). Creating a slot will also create its
              capacity “spots” for safe bookings.
            </p>
          </div>
          <form action={adminLogout}>
            <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              Admin logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Generate tee sheet</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Automatically generates tee times from <span className="font-medium">07:00</span> to{" "}
            <span className="font-medium">14:00</span>, every{" "}
            <span className="font-medium">20 minutes</span>.
          </p>

          <form action={generateTeeSheet} className="mt-4 space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                defaultValue={date}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="course">
                Course
              </label>
              <input
                id="course"
                name="course"
                defaultValue="Main Course"
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="capacity">
                Capacity
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                max={8}
                step={1}
                defaultValue={4}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
              />
            </div>

            <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
              Generate slots
            </button>
          </form>

          <form action={resetTeeSheet} className="mt-3">
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="course" value="Main Course" />
            <button className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900/30 dark:bg-zinc-900 dark:text-rose-200 dark:hover:bg-rose-950/30">
              Reset day (deletes slots)
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Slots for {date}</h2>
            <form method="get" className="flex items-center gap-2">
              <input
                name="date"
                type="date"
                defaultValue={date}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
              />
              <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                Go
              </button>
            </form>
          </div>

          {slots.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No slots yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{s.course}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {new Date(s.startsAt).toLocaleString()} • {s.available}/{s.capacity} available
                    </div>
                  </div>
                  <form action={deleteSlot}>
                    <input type="hidden" name="slotId" value={s.id} />
                    <input type="hidden" name="date" value={date} />
                    <button className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

