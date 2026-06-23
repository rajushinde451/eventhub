# EventHub — Beautiful Event Invitations & RSVP Platform

A production-ready SaaS platform for creating stunning event websites for weddings, birthdays, housewarmings, and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Supabase (Auth, Database, Storage) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth — Email/password + Google OAuth |
| Deployment | Vercel |

---

## Features

- **7 Event Templates** — Housewarming, Wedding, Birthday, Engagement, Anniversary, Naming Ceremony, Corporate
- **6-Step Creation Wizard** — Template → Details → Location → Gallery → Settings → Publish
- **RSVP System** — Attending / Not Attending / Maybe, guest count, duplicate prevention
- **QR Passes** — Auto-generated per guest, scannable at entry
- **Wishes Wall** — Guest messages with host moderation
- **Countdown Timer** — Live countdown on public event page
- **Add to Calendar** — Google Calendar + .ICS download (Outlook/Apple)
- **Entry Management** — QR scan check-in dashboard
- **Guest Dashboard** — Table with filters, CSV export
- **WhatsApp Sharing** — Optimized OpenGraph preview
- **Notification Architecture** — Pluggable service layer for WhatsApp/Twilio/Gupshup/Interakt
- **MyGate/NoBrokerHood** — Visitor pass service layer ready for integration
- **Dark Mode** — Full dark/light theme support

---

## FIRST TIME SETUP

Follow these steps once to get the project running from scratch.

---

### Step 1 — Install Node.js

Make sure you have **Node.js 18+** installed.

```bash
node -v    # should print v18.x.x or higher
```

If not installed, download from [nodejs.org](https://nodejs.org) (choose LTS version).

---

### Step 2 — Install Dependencies

```bash
cd EventsHub
npm install
```

This installs all packages listed in `package.json`. Takes ~1 minute.

---

### Step 3 — Create a Supabase Project

1. Go to **[supabase.com](https://supabase.com)** → click **Start your project**
2. Sign up with GitHub or email (free)
3. Click **New Project**
4. Fill in:
   - **Name:** `EventHub`
   - **Database Password:** create a strong password — **save this somewhere safe**
   - **Region:** choose the one closest to your users
     - India → `ap-south-1` (Mumbai) or `ap-southeast-1` (Singapore)
5. Click **Create new project** — wait about 1 minute for setup to complete

---

### Step 4 — Get Your Supabase API Keys

Once the project is ready:

1. In your Supabase project, click **Settings** (gear icon) in the left sidebar
2. Click **API**
3. You will see these values — copy each one:

| What you need | Where to find it | Variable name |
|--------------|-----------------|---------------|
| Project URL | "Project URL" box | `NEXT_PUBLIC_SUPABASE_URL` |
| Anon Key | "Project API keys" → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Service Role Key | "Project API keys" → `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

> **Warning:** Never share or commit the `service_role` key. It has full database access.

---

### Step 5 — Create Your .env.local File

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the values you copied:

```env
# Supabase — from supabase.com > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://abcxyz123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL — use localhost for development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Maps — optional, for embedded maps on event pages
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

### Step 6 — Run the Database Migration

This creates all the tables, policies, and triggers in your Supabase database.

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_initial_schema.sql` in your code editor
4. Select all the SQL content → copy it
5. Paste it into the Supabase SQL Editor
6. Click the green **Run** button

You should see:

```
Success. No rows returned
```

This means all 9 tables were created successfully.

---

### Step 7 — Enable Google Login (Optional)

Skip this if you only want email/password login.

**A. Get Google OAuth credentials:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URI:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   Replace `YOUR_PROJECT_REF` with your Supabase project reference (found in Settings → General)
7. Copy the **Client ID** and **Client Secret**

**B. Enable in Supabase:**

1. In Supabase → **Authentication → Providers → Google**
2. Toggle **Enable Google provider**
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

---

### Step 8 — Run the Development Server

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:3000
```

You should see the EventHub landing page. Sign up for an account and start creating events!

---

## NEXT TIME (Daily Development)

Every time you come back to work on the project, just run:

```bash
npm run dev
```

That's it. Everything else (Supabase, environment variables) is already set up.

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (checks for errors) |
| `npm run start` | Run production build locally |
| `npm run lint` | Check code for linting errors |

---

## Project Structure

```
EventsHub/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Public auth pages
│   │   │   ├── login/            # Sign in page
│   │   │   ├── signup/           # Sign up page
│   │   │   └── forgot-password/  # Password reset
│   │   ├── (dashboard)/          # Protected host area
│   │   │   ├── dashboard/        # Stats + event overview
│   │   │   └── events/
│   │   │       ├── create/       # 6-step event wizard
│   │   │       └── [id]/         # Per-event management
│   │   │           ├── page.tsx  # Event overview
│   │   │           ├── edit/     # Edit event details
│   │   │           ├── guests/   # RSVP list + CSV export
│   │   │           ├── wishes/   # Moderation panel
│   │   │           └── entry/    # QR code check-in
│   │   ├── event/[slug]/         # Public event page
│   │   ├── auth/callback/        # OAuth redirect handler
│   │   ├── actions/              # Server Actions (API logic)
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # shadcn/ui base components
│   │   ├── shared/               # Navbar, Sidebar, ThemeToggle
│   │   ├── events/               # Event cards, wizard steps
│   │   └── event-page/           # Public page sections
│   ├── lib/
│   │   ├── supabase/             # Supabase client (browser + server)
│   │   ├── notifications/        # Notification service (WhatsApp etc.)
│   │   ├── gate-integration/     # MyGate/NoBrokerHood service
│   │   ├── utils.ts              # Helper functions
│   │   └── validations.ts        # Zod form schemas
│   ├── types/
│   │   └── index.ts              # All TypeScript types
│   └── middleware.ts             # Auth route protection
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full database schema
├── .env.local.example            # Copy this to .env.local
├── .env.local                    # Your actual secrets (never commit)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles — auto-created when someone signs up |
| `events` | Event details, settings, and publish status |
| `gallery_images` | Photos uploaded to event gallery |
| `rsvps` | Guest responses with status and guest count |
| `wishes` | Guest messages shown on wishes wall |
| `qr_codes` | Unique QR entry pass per RSVP |
| `reminders` | Scheduled reminder records |
| `notification_logs` | Log of all notifications sent |
| `visitor_passes` | Gate integration visitor passes |

---

## URL Structure

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/signup` | Create account |
| `/login` | Sign in |
| `/dashboard` | Host dashboard |
| `/events` | All your events |
| `/events/create` | Create new event (6-step wizard) |
| `/events/[id]` | Manage a specific event |
| `/events/[id]/guests` | View RSVPs, export CSV |
| `/events/[id]/wishes` | Moderate wishes |
| `/events/[id]/entry` | QR code check-in scanner |
| `/event/[slug]` | **Public event page** — share this with guests |

### Example public event URL
```
http://localhost:3000/event/ramya-housewarming
```

---

## Deployment to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/eventhub.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **Add New Project** → import your GitHub repository
3. Click **Deploy** (Vercel auto-detects Next.js)

### Step 3 — Add Environment Variables on Vercel

1. In your Vercel project → **Settings → Environment Variables**
2. Add each variable from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → set this to your Vercel URL e.g. `https://eventhub.vercel.app`
3. Click **Redeploy**

### Step 4 — Update Supabase Redirect URLs

1. In Supabase → **Authentication → URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   ```

---

## Notification Integration (Future)

The notification service at `src/lib/notifications/service.ts` has ready-to-wire stubs for:

| Provider | Channel | Status |
|----------|---------|--------|
| WhatsApp Business API | WhatsApp | Stub ready |
| Twilio | SMS | Stub ready |
| Gupshup | WhatsApp/SMS | Stub ready |
| Interakt | WhatsApp | Stub ready |

To enable a provider — implement the stub function in `service.ts` and add your API key to `.env.local`.

---

## Gate Integration (Future)

`src/lib/gate-integration/service.ts` has stubs for:

| Provider | Status |
|----------|--------|
| MyGate | Stub ready |
| NoBrokerHood | Stub ready |
| Manual PDF Pass | Working |

Manual visitor passes are generated automatically for all attending guests.

---

## Common Issues

**`Error: supabaseUrl is required`**
→ Your `.env.local` file is missing or variables are not filled in. Re-check Step 5.

**`Invalid API key`**
→ You may have copied the wrong key. Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the `anon public` key, not the service role key.

**`relation "profiles" does not exist`**
→ The database migration was not run. Go back to Step 6 and run the SQL.

**`Google login not working`**
→ Check that the redirect URI in Google Cloud Console exactly matches `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.

**Port 3000 already in use**
→ Run on a different port:
```bash
npm run dev -- -p 3001
```

---

Built with Next.js 15, Supabase, and Tailwind CSS.
