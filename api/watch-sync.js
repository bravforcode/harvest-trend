/*
  Harvest Trend · รู้ทันราคา — watchlist sync keyed by LINE user id.

  GET  /api/watch-sync          → { items: [...] } (or { items: [] })
  PUT  /api/watch-sync          → body { items } upsert

  AUTH: every call MUST carry `Authorization: Bearer <token>` where token is
  either the LINE Login id_token (verified locally via api/line-verify.js) or
  the access_token (verified against LINE's profile endpoint). The identity
  used to read/write is the verified `sub` — the client-supplied line_sub is
  never trusted. 401 when the token is missing/invalid.

  Storage: Supabase `watchlists` table (server-managed, RLS deny-all, service
  role). Falls back to 501 when SUPABASE_URL/SERVICE_ROLE are missing.
*/
'use strict';

const { verifyIdToken } = require('./line-verify.js');

/* Resolve the verified LINE user id from an Authorization header.
   Accepts (in order): a locally-verifiable id_token, or an access_token
   confirmed against LINE's /v2/profile endpoint. Returns null when invalid. */
async function resolveLineSub(authHeader) {
  /* only Bearer tokens are accepted — anything else (Basic, raw string)
     is rejected up front so it never reaches the LINE profile API */
  const m = /^Bearer\s+(.+)$/i.exec(String(authHeader || ''));
  const token = m ? m[1].trim() : '';
  if (!token) return null;
  /* 1) id_token: local signature + aud + exp verification (no network) */
  const claims = verifyIdToken(token);
  if (claims && claims.sub) return claims.sub;
  /* 2) access_token: ask LINE who this token belongs to */
  try {
    const r = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined
    });
    if (r.ok) {
      const d = await r.json();
      if (d && typeof d.userId === 'string' && d.userId) return d.userId;
    }
  } catch { /* fall through → 401 */ }
  return null;
}

function readBody(req){
  let raw;
  if(typeof req.body === 'string') raw = req.body;
  else if(Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else if(req.body && typeof req.body === 'object') raw = JSON.stringify(req.body);
  else raw = '';
  try{ return JSON.parse(raw); }catch{ return null; }
}

async function getClient(){
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key) return null;
  try{
    const { createClient } = require('@supabase/supabase-js');
    return createClient(url, key, { auth: { persistSession: false } });
  }catch{ return null; }
}

module.exports = async function handler(req, res){
  const lineSub = await resolveLineSub(req.headers && req.headers.authorization);
  if(!lineSub){
    return res.status(401).json({ ok: false, error: 'unauthorized — send a valid LINE token' });
  }

  const sb = await getClient();
  if(!sb){
    return res.status(501).json({ ok: false, reason: 'not_configured' });
  }

  if(req.method === 'GET'){
    const { data, error } = await sb.from('watchlists').select('items').eq('line_sub', lineSub).maybeSingle();
    if(error) return res.status(500).json({ ok: false, error: 'db error' });
    return res.status(200).json({ items: Array.isArray(data?.items) ? data.items : [] });
  }

  if(req.method === 'PUT'){
    const body = readBody(req);
    const items = body && Array.isArray(body.items) ? body.items : null;
    if(!items) return res.status(400).json({ ok: false, error: '{items[]} required' });
    const { error } = await sb.from('watchlists').upsert(
      { line_sub: lineSub, items, updated_at: new Date().toISOString() },
      { onConflict: 'line_sub' }
    );
    if(error) return res.status(500).json({ ok: false, error: 'upsert failed' });
    return res.status(200).json({ ok: true, count: items.length });
  }

  return res.status(405).json({ error: 'method not allowed' });
};

module.exports._internals = { resolveLineSub };
