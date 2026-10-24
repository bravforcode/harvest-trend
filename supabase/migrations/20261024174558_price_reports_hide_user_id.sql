-- Harvest Trend — stop publishing the anonymous user_id on price reports (2026-10-24)
-- The "select all" policy lets anon and authenticated read every row. Table-level
-- SELECT covers every column, so a column-level REVOKE alone does nothing: revoke the
-- table-wide SELECT, then grant SELECT on the public columns only.
-- The client selects those columns explicitly (src/lib/supabase.ts). Insert, RLS and
-- service_role access are unchanged.
-- APPLIED to harvest-ecc (gxzxvlmawkfimmvhykou) on 2026-10-25, after the founder approved it.
-- Verified as anon: public columns readable; reading user_id returns permission denied.
-- Follow-up: UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER were revoked on 2026-10-25 by
-- 20261024182852_price_reports_lock_writes. INSERT stays on purpose: the app submits reports through it.

revoke select on public.price_reports from anon, authenticated;
grant select (id, crop, province, price, unit, note, lat, lng, photo_url, created_at)
  on public.price_reports to anon, authenticated;
