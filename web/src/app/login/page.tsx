import Link from "next/link";

import { getCurrentMember } from "@/auth/session";
import { memberLogin, logout } from "./actions";

export const dynamic = "force-dynamic";

function errorText(code: string | undefined) {
  if (!code) return null;
  if (code === "invalid") return "Invalid username or password.";
  return "Something went wrong.";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const currentMember = await getCurrentMember();
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight">Member login</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Log in to your member account to book tee times and view your bookings.
        </p>
      </div>

      {currentMember ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Currently logged in as</p>
              <p className="text-base font-semibold">{currentMember.name}</p>
            </div>
            <form action={logout}>
              <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {errorText(error) ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {errorText(error)}
        </div>
      ) : null}

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <form action={memberLogin} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
              required
            />
          </div>
          <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
            Log in
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          No account?{" "}
          <Link className="font-medium underline underline-offset-4" href="/register">
            Create one
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

