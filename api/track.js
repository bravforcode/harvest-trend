/*
  Harvest Trend · รู้ทันราคา — lightweight analytics beacon (privacy-friendly).

  POST /api/track  { page, event }  → 204 (fire-and-forget)
    - No PII: only a page path + event name + server timestamp are stored.
    - Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY; otherwise 204 no-op
      (analytics must never break or slow the app).
    - Client sends via navigator.sendBeacon so it survives page navigation.
*/
'use strict';

function readBody(req) {
  let raw;
  if (typeof req.body === 'string') raw = req.body;
  else if (Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else if (req.body && typeof req.body === 'object') raw = JSON.stringify(req.body);
  else raw = '';
  try { return JSON.parse(raw); } catch { return null; }
}

async function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(url, key, { auth: { persistSession: false } });
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const body = readBody(req);
  const page = body && typeof body.page === 'string' ? body.page.slice(0, 200) : '';
  const event = body && typeof body.event === 'string' ? body.event.slice(0, 60) : 'pageview';
  const sb = await getClient();
  if (sb && page) {
    try {
      await sb.from('analytics_events').insert({ page, event });
    } catch { /* analytics failure is invisible to the app */ }
  }
  return res.status(204).end();
};
