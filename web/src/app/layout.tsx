import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golf Club Tee Times (Demo)",
  description: "Prototype: member tee time booking and management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-dvh bg-zinc-50 text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50"
      >
        <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
          <header className="flex items-center justify-between gap-4 py-6">
            <div className="flex flex-col">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Golf Club Management System
              </Link>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Tee sheet, bookings, admin slots
              </span>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <NavLink href="/login">Member login</NavLink>
              <NavLink href="/register">Register</NavLink>
              <NavLink href="/tee-sheet">Tee sheet</NavLink>
              <NavLink href="/bookings">My bookings</NavLink>
              <NavLink href="/admin/login">Admin</NavLink>
            </nav>
          </header>

          <main className="flex-1 pb-10">{children}</main>

          <footer className="border-t border-zinc-200 py-6 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            Demo prototype for Vercel deployment.
          </footer>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}
