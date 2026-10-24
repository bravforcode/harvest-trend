-- Harvest Trend — stop publishing the anonymous user_id on price reports (2026-10-24)
-- The "select all" policy lets anon and authenticated read every row. Table-level
-- SELECT covers every column, so a column-level REVOKE alone does nothing: revoke the
-- table-wide SELECT, then grant SELECT on the public columns only.
-- The client selects those columns explicitly (src/lib/supabase.ts). Insert, RLS and
-- service_role access are unchanged.
-- NOT APPLIED to the live project yet: run only after the founder approves.

revoke select on public.price_reports from anon, authenticated;
grant select (id, crop, province, price, unit, note, lat, lng, photo_url, created_at)
  on public.price_reports to anon, authenticated;
