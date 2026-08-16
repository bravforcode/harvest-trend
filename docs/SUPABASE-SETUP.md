# Supabase Setup — Farmer Price Reports (Harvest Trend)

Backend scaffold for crowdsourced farmer price reports. Everything is **disabled by
default**: without env vars the app behaves exactly as before. No UI is wired yet.

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Table + RLS policies + index (run once in SQL Editor) |
| `src/lib/supabase.ts` | Env-gated client: `submitPriceReport()`, `fetchRecentReports()`, `ensureClient()` |
| This doc | Step-by-step setup + compliance + gotchas |

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. **Region: Singapore (`ap-southeast-1`)** — nearest region with good latency
   from Thailand. ⚠️ See [PDPA / cross-border](#4-pdpa-checklist) — storing data
   outside Thailand is a *cross-border transfer* and must be disclosed to users.
3. Pick a strong database password and save it (the anon key is what the app uses —
   never expose the service_role key).
4. Note the **Project URL** (e.g. `https://abcdefgh.supabase.co`) and the **anon
   public key** (Dashboard → Settings → API).

## 2. Run the schema

1. Open Dashboard → **SQL Editor** → New query.
2. Paste the entire contents of `supabase/schema.sql`.
3. Run. It is idempotent (`IF NOT EXISTS` / `IF NOT EXISTS`-style guards) — safe to
   re-run.
4. Verify: **Table Editor** → `price_reports` exists; **Authentication → Policies**
   shows `insert own or anon` and `select all` and **no** update/delete policies.

## 3. Enable anonymous sign-ins (required)

1. Dashboard → **Authentication → Sign In / Up**.
2. Turn on **Anonymous sign-ins** (creates real `auth.users` rows with the
   `is_anonymous` claim — the RLS policy covers them, see the schema header).

## 4. PDPA checklist (Thailand Personal Data Protection Act)

Location data (`lat`/`lng`) and any free-text `note` are **personal data** when they
can identify a person. Before enabling the form in the UI:

- [ ] **Consent checkbox** next to the location field: “I consent to sharing my
      location with this report” — opt-in, not pre-checked.
- [ ] **No-location path**: submitting without coordinates must be fully supported
      (`lat`/`lng` are nullable; the API already accepts `undefined`).
- [ ] **Privacy notice** (visible before submit) stating: what is collected
      (crop, province, price, optional unit/note/location/photo), why (public price
      transparency), retention (rows are append-only and public), and that reports
      are **public** — anyone can read them.
- [ ] **Cross-border disclosure**: data is stored in **Singapore** on Supabase's
      cloud. State this in the privacy notice. If Thai data-residency becomes a
      hard requirement, recreate the project in the **Bangkok region** and re-run
      `schema.sql`.
- [ ] **Immutable reports**: there are no update/delete policies, so users cannot
      edit or withdraw a report through the app — say so in the notice.
      (Deletion requests are handled manually by an admin via the Dashboard.)

## 5. Install the client (one-time)

```sh
bun add @supabase/supabase-js
```

Without this package the app still builds and runs — `src/lib/supabase.ts` loads it
lazily and every call degrades gracefully (`not_configured` / `[]`).

## 6. Set env vars

Local dev — create `.env.local` at the repo root (gitignored):

```sh
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
```

Production (Vercel):

```sh
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env pull --environment=production
```

> Vite exposes `VITE_*` vars to the client bundle. The **anon key is public by
> design** (RLS is the security boundary) — do not put the service_role key here.

## 7. Free-tier gotchas

- **7-day inactivity pause**: free projects are paused after 7 days without API
  calls. The app is mostly client-side, so it will get paused. Options:
  - A GitHub Actions cron hitting a tiny endpoint weekly, or
  - Any uptime monitor (UptimeRobot free tier) pinging `GET /rest/v1/health` or a
    Vercel serverless route that does a lightweight supabase-js call.
  - **Important**: Vercel serverless functions must use **supabase-js** (HTTPS to
    the API gateway), *not* a direct Postgres connection — the free tier exposes
    the pooler over **IPv6**, which Vercel (IPv4-only) cannot reach.
- **Numeric columns come back as strings** from PostgREST — `fetchRecentReports`
  already normalizes `price` to `Number`.
- **Anonymous user churn**: every anonymous sign-in creates an `auth.users` row.
  Supabase periodically deletes stale anonymous users; on very low-traffic apps a
  visitor may get a new anonymous identity — harmless, reports keep their own
  `user_id`.

## 8. Wiring the UI later (out of scope now)

No UI changes were made in this task. When ready:

1. Import `submitPriceReport`, `fetchRecentReports`, `isSupabaseReady` from
   `@/lib/supabase`.
2. Render nothing new when `!isSupabaseReady` (feature silently hidden) — or show
   a small “sync unavailable” hint.
3. Add the consent checkbox + privacy notice per section 4 before any
   lat/lng submission.
4. Consider a `photo_url` upload path (Supabase Storage + public bucket) — the
   column already exists.
