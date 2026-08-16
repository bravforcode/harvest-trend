-- Harvest Trend — push subscriptions + watchlist sync (2026-08-16)
-- Server-managed tables: accessed only via service-role from serverless
-- functions; RLS is enabled with NO policies (deny everything for clients).

create table if not exists public.push_subs (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  crop text,
  province text,
  threshold_price numeric,
  created_at timestamptz default now()
);
alter table public.push_subs enable row level security;

create table if not exists public.watchlists (
  line_sub text primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);
alter table public.watchlists enable row level security;
