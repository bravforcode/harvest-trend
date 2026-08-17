-- Harvest Trend — lightweight, privacy-friendly analytics (2026-08-17)
-- Server-managed: written only via service role from api/track.js; RLS with
-- NO policies so clients can never read or write it. No PII: we store a page
-- path + event name + timestamp only (no IP, no user id, no fingerprint).

create table if not exists public.analytics_events (
  id         bigint generated always as identity primary key,
  page       text not null,
  event      text not null default 'pageview',
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);

comment on table public.analytics_events is
  'Lightweight usage analytics (page + event + timestamp only — no PII). '
  'Written by service role via api/track.js; RLS denies all client access.';
