# Pledge Tracker

A lightweight web app for tracking pledged and received donations, with a Venmo/Cash
selector. No payment processing is involved — this is purely a tracking ledger.

- Donors submit pledges from a mobile-friendly public form (`/`).
- Administrators log in at `/admin/login` and confirm/update pledge status at `/admin`.
- A public progress page (`/progress`) shows a live total-raised progress bar with no donor details exposed.

## Tech Stack
- Next.js 14 (App Router) + Tailwind CSS
- Prisma ORM + PostgreSQL
- Simple cookie-based admin auth (no third-party auth service needed)

## 1. Local setup (run once, to generate migration files)
```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL (any Postgres works for this local step), ADMIN_PASSWORD, SESSION_SECRET
npx prisma migrate dev --name init
npm run dev
```
Visit http://localhost:3000 for the donor form, http://localhost:3000/progress for the
public progress bar, and http://localhost:3000/admin for the dashboard.

Running `npx prisma migrate dev` creates a `prisma/migrations/` folder — make sure it gets
uploaded to GitHub too, since Render needs it to set up your database tables during deploy.

## 2. Upload to GitHub via the web (no command line needed)
1. Unzip this project on your computer.
2. Go to https://github.com/new and create a new empty repository (e.g. `pledge-tracker`).
3. On the repo's page, click **"uploading an existing file"**.
4. Drag the entire contents of the unzipped folder into the browser upload area.
5. **Do not upload your real `.env` file** — only `.env.example`.
6. Commit the changes.
7. Confirm `prisma/migrations/` and `render.yaml` both made it into the repo.

## 3. Deploy on Render with its managed Postgres

### Option A: One-click Blueprint deploy (recommended)
This project includes a `render.yaml` Blueprint file that defines both the web service
and a managed Postgres database together, so Render creates everything in one step.

1. Push this project to GitHub (step 2 above).
2. In the Render dashboard, click **New -> Blueprint**.
3. Connect your GitHub repo. Render detects `render.yaml` automatically and shows a
   preview: a **Web Service** (`pledge-tracker`) and a **PostgreSQL database**
   (`pledge-tracker-db`).
4. Render prompts you to enter `ADMIN_PASSWORD` (marked `sync: false`, so it asks you
   securely instead of using a default). `SESSION_SECRET` is generated automatically, and
   `DATABASE_URL` is wired up automatically to the new database's internal connection
   string — no copy/pasting needed.
5. Click **Apply**. Render provisions the Postgres database, builds the web service, and
   runs the Prisma migration automatically during the build step
   (`prisma generate && prisma migrate deploy && next build`).
6. Once deployed, your app is live at the `*.onrender.com` URL Render gives you, with
   `/` (pledge form), `/progress` (public progress bar), and `/admin` (dashboard).

You can adjust the plan (free vs. paid tier) for either the web service or the database
directly in `render.yaml` before deploying, or afterward in the Render dashboard.

### Option B: Manual setup (without the Blueprint file)
1. In the Render dashboard: **New -> PostgreSQL**. Create the database and copy its
   **Internal Database URL**.
2. **New -> Web Service** -> connect your GitHub repo.
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Add environment variables:
   - `DATABASE_URL` -> the Internal Database URL from step 1
   - `ADMIN_PASSWORD` -> your chosen admin password
   - `SESSION_SECRET` -> a long random string (e.g. from `openssl rand -hex 32`)
4. Deploy. The build step runs the Prisma migration automatically against your database.

### A note on Render's free tier
Free Postgres databases on Render expire after 30 days, and free web services spin down
after periods of inactivity (causing a ~30-60 second cold start on the next request). If
this app is tracking an ongoing fundraiser, consider the paid Starter tier for the database
so your pledge data isn't at risk of being deleted after a month.

## CSV Export
From the admin dashboard, click **Export CSV** to download every pledge (donor name, contact,
amounts, method, status, notes, timestamps) as a `.csv` file you can open in Excel/Google Sheets.
This endpoint (`/api/pledges/export`) is protected by the same admin login as the rest of the
dashboard.

## Embedding the Progress Bar Elsewhere
The `/progress` page is public and safe to embed on another website (e.g., a fundraising page
or campaign site) since it never exposes donor names or contact details — only aggregate totals.

```html
<iframe
  src="https://YOUR-APP-NAME.onrender.com/progress"
  style="width: 100%; max-width: 480px; height: 420px; border: none;"
  title="Fundraising Progress"
></iframe>
```
Replace the `src` with your actual deployed URL. No extra configuration is needed.

## Other Ideas for Extending
- Admin auth here is a single shared password stored in `ADMIN_PASSWORD`. For multiple
  admins with individual accounts, swap in NextAuth or Clerk.
- Add email/SMS notifications (e.g., via Resend or Twilio) when a pledge is marked received.
