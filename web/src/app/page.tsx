import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Members can create accounts, book tee times, and view/cancel bookings. Admin access is a
          fixed username/password (current username: admin, password: adminpassword).
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryLink href="/register">Create member account</PrimaryLink>
          <SecondaryLink href="/login">Member login</SecondaryLink>
          <SecondaryLink href="/tee-sheet">View tee sheet</SecondaryLink>
          <SecondaryLink href="/admin/login">Admin login</SecondaryLink>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Member flow"
          body="Register/login, browse tee times, and book an available spot."
          href="/register"
          linkText="Create account"
        />
        <FeatureCard
          title="Bookings"
          body="See your upcoming bookings and cancel if needed."
          href="/bookings"
          linkText="View bookings"
        />
        <FeatureCard
          title="Admin tee sheet"
          body="Admins create tee time slots and capacity."
          href="/admin/login"
          linkText="Admin login"
        />
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  body,
  href,
  linkText,
}: {
  title: string;
  body: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
      <div className="mt-4">
        <Link className="text-sm font-medium underline underline-offset-4" href={href}>
          {linkText}
        </Link>
      </div>
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}
