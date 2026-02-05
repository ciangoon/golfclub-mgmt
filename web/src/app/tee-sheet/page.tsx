import Link from "next/link";
import { and, asc, eq, gte, lt, sql } from "drizzle-orm";

import { getCurrentMember } from "@/auth/session";
import { getDb } from "@/db";
import { teeTimeSlots, teeTimeSpots } from "@/db/schema";

import { bookSpot } from "./actions";

export const dynamic = "force-dynamic";

function formatLocalDateYYYYMMDD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function errorMessage(code: string | undefined) {
  if (!code) return null;
  if (code === "full") return "That tee time is fully booked.";
  if (code === "already_booked") return "You already have a booking in that tee time.";
  return "Something went wrong. Please try again.";
}

export default async function TeeSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; error?: string }>;
}) {
  const member = await getCurrentMember();
  const { date: dateParam, error } = await searchParams;
  const date = dateParam ?? formatLocalDateYYYYMMDD(new Date());

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  let slots:
    | Array<{
        id: string;
        course: string;
        startsAt: Date;
        capacity: number;
        available: number;
      }>
    | null = null;
  let dbError: string | null = null;

  try {
    const db = getDb();
    slots = await db
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
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Failed to connect to database.";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight">Tee sheet</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Browse tee time slots for a selected day and book an available spot.
        </p>
      </div>

      {errorMessage(error) ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {errorMessage(error)}
        </div>
      ) : null}

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Selected day</p>
            <p className="text-base font-semibold">{date}</p>
          </div>
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {member ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Logged in as <span className="font-medium text-zinc-900 dark:text-zinc-50">{member.name}</span>
            </p>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Not logged in.{" "}
              <Link className="font-medium underline underline-offset-4" href="/login">
                Member login
              </Link>{" "}
              to book.
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="font-medium underline underline-offset-4" href="/bookings">
              My bookings
            </Link>
            <Link className="font-medium underline underline-offset-4" href="/admin/login">
              Admin
            </Link>
          </div>
        </div>
      </div>

      {dbError ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-semibold">Database not configured yet</p>
          <p className="mt-2">
            {dbError} Set <code className="font-mono">DATABASE_URL</code> and run migrations.
          </p>
        </div>
      ) : slots && slots.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No tee times for this day yet. Ask an admin to generate them in{" "}
          <Link className="font-medium underline underline-offset-4" href="/admin/login">
            Admin login
          </Link>
          .
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-3xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {(slots ?? []).map((s) => {
            const canBook = Boolean(member) && s.available > 0;
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{s.course}</div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {new Date(s.startsAt).toLocaleString()} • {s.available}/{s.capacity} available
                  </div>
                </div>
                <form action={bookSpot}>
                  <input type="hidden" name="slotId" value={s.id} />
                  <input type="hidden" name="date" value={date} />
                  <button
                    disabled={!canBook}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                    title={!member ? "Log in to book" : s.available <= 0 ? "Fully booked" : "Book a spot"}
                  >
                    Book
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

