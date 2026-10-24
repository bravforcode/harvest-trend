-- Harvest Trend — lock price_reports writes for anon and authenticated (2026-10-25)
-- Approved by the founder in chat and applied to harvest-ecc (gxzxvlmawkfimmvhykou).
-- Removes UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER. Keeps INSERT, because the
-- app submits reports through it, and keeps the public column SELECT from
-- price_reports_hide_user_id. RLS already blocks UPDATE and DELETE; this also closes
-- the grants that RLS does not filter.

revoke update, delete, truncate, references, trigger on public.price_reports from anon, authenticated;
