## Golf club management demo

The Next.js prototype lives in the [`web/`](./web) folder.

### Run locally

```bash
cd web
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

If you're using PowerShell instead of Git Bash:

```powershell
Copy-Item .env.example .env.local
```

### Deploy to Vercel
- Import the repo in Vercel
- Set **Root Directory** to `web`
- Add env vars: `DATABASE_URL`, `SESSION_COOKIE_SECRET`, `DEMO_MODE=true`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- Run `npm run db:migrate` once against your hosted DB

