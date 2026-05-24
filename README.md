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


## Key Implementation Notes

- Auth flow — The extension never touches Supabase directly. It opens `/auth/extension-login`, which completes OAuth and postMessage tokens back to `auth-receiver.js` content script, which relays them to `background.js` via `chrome.runtime.sendMessage`. This avoids needing an OAuth2 block in the manifest.


Token refresh — utils/api.js checks expires_at before every API call. If within 60 seconds of expiry, it silently refreshes via POST /api/auth/refresh before continuing. The background service worker also handles explicit REFRESH_TOKEN messages from the popup.

RLS + service role — All API routes use the SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) after manually verifying the JWT, so you get proper auth checking at the application layer while keeping DB operations fast. The RLS policies are still enabled as a defense-in-depth layer.

Cron security — The /api/cron/reminders route checks Authorization: Bearer <CRON_SECRET>. Vercel injects this header automatically for registered cron jobs when you set CRON_SECRET as an env var.

LeetCode SPA handling — content.js uses two MutationObserver instances: one watching for the React-rendered h1 to appear, and one watching for URL changes to handle problem-to-problem navigation without page reloads.
