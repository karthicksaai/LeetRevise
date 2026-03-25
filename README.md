# LeetRevise

A full-stack spaced repetition system for LeetCode. When you cannot solve a problem, click the injected button to schedule Day 3, 7, 15, and 30 revision reminders via Google Calendar events and daily email digests.

## Features

- Chrome extension injects a button on every LeetCode problem page
- One-click scheduling creates revision events in your database and Google Calendar
- Daily 8 AM IST email digest listing all problems due that day via Resend
- Dashboard to view pending revisions, filter by difficulty/topic, and mark solved
- Analytics charts: by topic, by difficulty, solve timeline
- Full Google OAuth with token refresh handled in the extension

## Architecture

```
Browser (LeetCode)
  |
  | content.js (injects button)
  |
  v
Chrome Extension Popup ──── background.js (token refresh, auth state)
  |
  | Bearer token API calls
  v
Next.js API Routes (Vercel)
  |── /api/schedule       POST  save problem + create calendar events
  |── /api/problems       GET   list problems with revision events
  |── /api/solve          PATCH mark problem + events as solved
  |── /api/stats          GET   aggregated stats
  |── /api/cron/reminders GET   daily digest job (Vercel Cron 02:30 UTC)
  |── /api/auth/callback  GET   Supabase OAuth callback
  |── /api/auth/refresh   POST  token refresh for extension
  |
  v
Supabase (PostgreSQL + Auth)     Google Calendar API     Resend
  users
  scheduled_problems
  revision_events
```

## Local Setup

```bash
git clone https://github.com/your-username/leetrevise
cd leetrevise/web
npm install
cp .env.example .env.local
# Fill in env vars (see below)
npm run dev
```

## Environment Variables

Create `web/.env.local`:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_key
CRON_SECRET=a-random-secret-string-you-generate
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

text

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Go to Authentication > Providers > Google and enable Google OAuth
4. Copy `Project URL` and `anon` + `service_role` keys from Project Settings > API

## Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project, enable **Google Calendar API** and **Google People API**
3. Create OAuth 2.0 credentials (Web Application)
4. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret into Supabase's Google provider settings

## Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Generate an API key and add it as `RESEND_API_KEY`
3. Add and verify your sending domain (or use the sandbox `onboarding@resend.dev` for testing)
4. Update the `from` address in `web/lib/mailer.ts`

## Loading the Extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer Mode** (top right)
3. Click **Load Unpacked**
4. Select the `extension/` folder
5. Pin LeetRevise from the extensions toolbar

Before loading, replace all `https://your-app.vercel.app` occurrences in:
- `extension/utils/api.js`
- `extension/background.js`
- `extension/popup/popup.js`

with your actual Vercel deployment URL.

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the `web/` directory as a new Vercel project (set root directory to `web`)
3. Add all environment variables in Vercel Project Settings > Environment Variables
4. Deploy — Vercel automatically reads `vercel.json` and registers the cron job

The cron job at `30 2 * * *` (UTC) fires at 8:00 AM IST and sends email digests.
Vercel secures it with the `Authorization: Bearer <CRON_SECRET>` header check.
This is the complete LeetRevise codebase. Here's a summary of every key design decision made:

## Key Implementation Notes

- Auth flow — The extension never touches Supabase directly. It opens `/auth/extension-login`, which completes OAuth and postMessage tokens back to `auth-receiver.js` content script, which relays them to `background.js` via `chrome.runtime.sendMessage`. This avoids needing an OAuth2 block in the manifest.
​

Token refresh — utils/api.js checks expires_at before every API call. If within 60 seconds of expiry, it silently refreshes via POST /api/auth/refresh before continuing. The background service worker also handles explicit REFRESH_TOKEN messages from the popup.

RLS + service role — All API routes use the SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) after manually verifying the JWT, so you get proper auth checking at the application layer while keeping DB operations fast. The RLS policies are still enabled as a defense-in-depth layer.

Cron security — The /api/cron/reminders route checks Authorization: Bearer <CRON_SECRET>. Vercel injects this header automatically for registered cron jobs when you set CRON_SECRET as an env var.

LeetCode SPA handling — content.js uses two MutationObserver instances: one watching for the React-rendered h1 to appear, and one watching for URL changes to handle problem-to-problem navigation without page reloads.