import Link from "next/link";

import { registerMember } from "./actions";

export const dynamic = "force-dynamic";

function errorText(code: string | undefined) {
  if (!code) return null;
  if (code === "name") return "Please enter your name.";
  if (code === "username") return "Username must be at least 3 characters.";
  if (code === "password") return "Password must be at least 6 characters.";
  if (code === "exists") return "That username is already taken.";
  return "Something went wrong.";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight">Create member account</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Register a member account to book tee times.
        </p>
      </div>

      {errorText(error) ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {errorText(error)}
        </div>
      ) : null}

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <form action={registerMember} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
              required
            />
          </div>
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
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Lowercase recommended. Minimum 3 characters.
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
              required
            />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Minimum 6 characters.</p>
          </div>
          <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
            Create account
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link className="font-medium underline underline-offset-4" href="/login">
            Member login
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

