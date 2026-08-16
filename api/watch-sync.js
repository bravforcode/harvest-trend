/*
  Harvest Trend · รู้ทันราคา — watchlist sync keyed by LINE user id.

  GET  /api/watch-sync?line_sub=<id>   → { items: [...] } (or { items: [] })
  PUT  /api/watch-sync                 → body { line_sub, items } upsert

  Storage: Supabase `watchlists` table (server-managed, RLS deny-all, service
  role). Falls back to 501 when SUPABASE_URL/SERVICE_ROLE are missing.

  HONEST NOTE: line_sub is treated as the identity key — the server does not
  re-verify the LINE token on every call (the client obtained it via the LINE
  Login PKCE flow). Anyone who knows a user id could overwrite that user's
  sync row. Acceptable for the hackathon; production should verify the id_token
  (or use a signed session) before writing.
*/
'use strict';

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
  const sb = await getClient();
  if(!sb){
    return res.status(501).json({ ok: false, reason: 'not_configured' });
  }

  if(req.method === 'GET'){
    const lineSub = String(req.query.line_sub || '');
    if(!lineSub) return res.status(400).json({ ok: false, error: 'line_sub required' });
    const { data, error } = await sb.from('watchlists').select('items').eq('line_sub', lineSub).maybeSingle();
    if(error) return res.status(500).json({ ok: false, error: 'db error' });
    return res.status(200).json({ items: Array.isArray(data?.items) ? data.items : [] });
  }

  if(req.method === 'PUT'){
    const body = readBody(req);
    const lineSub = body && typeof body.line_sub === 'string' ? body.line_sub : null;
    const items = body && Array.isArray(body.items) ? body.items : null;
    if(!lineSub || !items) return res.status(400).json({ ok: false, error: '{line_sub, items[]} required' });
    const { error } = await sb.from('watchlists').upsert(
      { line_sub: lineSub, items, updated_at: new Date().toISOString() },
      { onConflict: 'line_sub' }
    );
    if(error) return res.status(500).json({ ok: false, error: 'upsert failed' });
    return res.status(200).json({ ok: true, count: items.length });
  }

  return res.status(405).json({ error: 'method not allowed' });
};
