# Golf club management system

Prototype platform for:
- Member **username + password** accounts (register + login)
- Tee sheet browsing + booking/cancellation (capacity enforced via `tee_time_spots`)
- Admin tee sheet generation (07:00–14:00 every 20 minutes)

## Stack
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

3. Create a free Postgres database on Neon and set `DATABASE_URL`.

### Create a Neon account + database
- Go to Neon and create a free account/project.
- In the Neon dashboard, open your project and find **Connection details**.
- Copy the **connection string** (it starts with `postgresql://...`).
- Paste it into `DATABASE_URL` in `.env.local`.

Notes:
- Use a URL that includes `sslmode=require`.
- If Neon shows both a **pooled** URL (often includes `-pooler`) and a **direct** URL, either works for this prototype.

4. Generate secrets and set env vars.

#### Generate a random string (Git Bash)

```bash
openssl rand -base64 32
```

If `openssl` isn’t available, use Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Set these in `.env.local`:
- `DATABASE_URL` (Neon Postgres connection string)
- `SESSION_COOKIE_SECRET` (random string)
- `ADMIN_USERNAME` (choose a admin username)
- `ADMIN_PASSWORD` (choose a admin password)
- `DEMO_MODE=true` (optional)

5. Run migrations:

```bash
npm run db:migrate
```

6. Start dev server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Demo flow
- Register a member at `/register` and log in (creates a signed session cookie).
- Log in as admin at `/admin/login` to create tee time slots.
- Go to `/tee-sheet` to book; go to `/bookings` to cancel.