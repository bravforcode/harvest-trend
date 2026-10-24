-- ============================================================================
-- Harvest Trend · รู้ทันราคา — Supabase schema: farmer price reports
-- ============================================================================
-- Run this file in the Supabase Dashboard → SQL Editor (one shot, idempotent).
--
-- RESEARCH-DERIVED CONSTRAINTS (see docs/SUPABASE-SETUP.md for the full writeup)
--
-- 1. Anonymous sign-in:
--    Supabase "anonymous sign-in" (Auth → Sign In / Up → Anonymous sign-ins)
--    creates a REAL row in auth.users carrying the `is_anonymous` claim
--    (auth.jwt() ->> 'is_anonymous' = 'true'). Anonymous users are still
--    `authenticated` with a real uid, so `auth.uid() = user_id` matches them
--    like any other user. The insert policy below therefore allows:
--      • fully unauthenticated inserts (anon role, no session → auth.uid() IS NULL)
--      • any authenticated user (including anonymous users) inserting rows
--        where user_id = auth.uid()
--    The `user_id DEFAULT auth.uid()` column default is what makes the RLS
--    check pass when the client does not (and should not) guess a user id —
--    Postgres applies defaults BEFORE evaluating WITH CHECK.
--
--    If you later want to EXCLUDE anonymous users from reporting, swap the
--    insert policy for:
--      create policy "insert own or anon" on public.price_reports
--        for insert to anon, authenticated
--        with check (
--          (auth.jwt() ->> 'is_anonymous') IS NULL
--          AND (auth.uid() IS NULL OR auth.uid() = user_id)
--        );
--
-- 2. PDPA (Thailand Personal Data Protection Act):
--    lat/lng is location data → personal data. The UI must collect explicit
--    consent (checkbox + privacy notice) before submitting coordinates, and
--    must offer a no-location path (lat/lng nullable). Documented in the
--    SETUP doc; enforcement is client-side (consent) + DB (nullable columns).
--
-- 3. Cross-border storage (Singapore region):
--    For Thailand-based users, storing personal data in Supabase's Singapore
--    region is a cross-border transfer — disclose it in the privacy notice.
--    If Thai data-residency becomes mandatory, re-create the project in the
--    Bangkok region (ap-southeast-1) and re-run this schema.
--
-- 4. Immutability:
--    Reports are append-only public price data. No UPDATE / DELETE policies
--    are created, so no role (anon or authenticated) can modify or delete
--    rows through the API. Administrative cleanup happens in the Dashboard.
-- ============================================================================

-- gen_random_uuid() is built into PostgreSQL 13+ (Supabase runs PG 15) — no
-- pgcrypto extension required.

create table if not exists public.price_reports (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        default auth.uid() references auth.users(id) on delete set null,
  crop       text        not null,
  province   text        not null,
  price      numeric     not null check (price > 0),
  unit       text        null,
  note       text        null,
  lat        numeric     null,
  lng        numeric     null,
  photo_url  text        null,
  created_at timestamptz not null default now()
);

comment on table public.price_reports is
  'Farmer-submitted crop price reports. Append-only (no update/delete policies); '
  'public read; inserts allowed for anonymous (incl. Supabase anonymous sign-in '
  'users) and authenticated users. lat/lng is PDPA personal data — collect with consent.';

comment on column public.price_reports.user_id is
  'Defaults to auth.uid() so RLS insert check (auth.uid() = user_id) passes for '
  'anonymous sign-in users (real auth.users rows with is_anonymous claim). NULL '
  'for fully unauthenticated inserts.';

-- Row Level Security: public price data — anyone may read, anyone may add
-- (own row), nobody may edit or delete.

alter table public.price_reports enable row level security;

create policy "insert own or anon" on public.price_reports
  for insert to anon, authenticated
  with check (auth.uid() is null or auth.uid() = user_id);

create policy "select all" on public.price_reports
  for select to anon, authenticated
  using (true);

-- Intentionally NO update / delete policies — reports are immutable.

-- Column-level read: user_id stays private. Table-wide SELECT would expose every
-- column, so revoke it and grant only the public columns. Same as the migration
-- supabase/migrations/20261024120000_price_reports_hide_user_id.sql.
revoke select on public.price_reports from anon, authenticated;
grant select (id, crop, province, price, unit, note, lat, lng, photo_url, created_at)
  on public.price_reports to anon, authenticated;

-- Typical query: latest reports for a crop × province.
create index if not exists price_reports_crop_province_created_idx
  on public.price_reports (crop, province, created_at desc);
