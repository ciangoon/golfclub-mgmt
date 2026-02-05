import Link from "next/link";

import { adminLogin } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Admin access is controlled by a fixed username/password (from environment variables).
        </p>
      </div>

      {error === "invalid" ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          Invalid admin credentials.
        </div>
      ) : null}

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <form action={adminLogin} className="space-y-4">
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

        <div className="mt-4 text-sm">
          <Link className="font-medium underline underline-offset-4" href="/">
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}

