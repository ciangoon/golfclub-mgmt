# Golf club booking demo (prototype)

Prototype platform for:
- Demo member login (seeded accounts)
- Tee sheet / tee time slot browsing
- Booking/cancellation with capacity enforcement via `tee_time_spots`
- Admin-managed tee time slots

## Tech
- Next.js (App Router) deployed to Vercel
- Postgres (Neon or Supabase)
- Drizzle ORM + Drizzle migrations

## Local setup
1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
cp .env.example .env.local
```

If you're using PowerShell instead of Git Bash:

```powershell
Copy-Item .env.example .env.local
```

Set:
- `DATABASE_URL` (Neon/Supabase Postgres connection string)
- `SESSION_COOKIE_SECRET` (random string)
- `DEMO_MODE=true` (enables demo seeding)
- `ADMIN_USERNAME` (fixed admin username)
- `ADMIN_PASSWORD` (fixed admin password)

3. Run migrations:

```bash
npm run db:migrate
```

4. Start dev server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Demo flow
- Register a member at `/register` and log in (creates a signed session cookie).
- Log in as admin at `/admin/login` to create tee time slots.
- Go to `/tee-sheet` to book; go to `/bookings` to cancel.

## Deploy to Vercel
This repository is a monorepo-style layout; the Next.js app lives in this `web/` directory.

- In Vercel, set **Root Directory** to `web` when importing the project.
- Add env vars in Vercel project settings:
  - `DATABASE_URL`
  - `SESSION_COOKIE_SECRET`
  - `DEMO_MODE=true`
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- Apply migrations once (run locally against the hosted DB):

```bash
npm run db:migrate
```
