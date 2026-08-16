/*
  Harvest Trend · รู้ทันราคา — web push subscription registry (Vercel serverless).

  POST /api/push
    { sub: { endpoint, p256dh, auth }, threshold?: { p, c, price } }  → register
    { unsub: true, sub: { endpoint } }                                → remove

  Storage: Supabase `push_subs` table (server-managed, RLS deny-all, accessed
  with the service-role key from SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
  Falls back to a module-level Map (in-memory, per instance) when those env
  vars are missing — honest degradation, same as before.

  Exports sendPushes(fetchPrices) for the daily cron (api/push-check.js).
*/
'use strict';

const MAX_SUBS = 100;
const memSubs = new Map(); // fallback store: endpoint -> { sub, threshold }

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

async function subCount(sb){
  if(sb){
    const { count, error } = await sb.from('push_subs').select('endpoint', { count: 'exact', head: true });
    return error ? -1 : (count ?? 0);
  }
  return memSubs.size;
}

module.exports = async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({ error: 'method not allowed' });
  }
  if(!process.env.VAPID_PRIVATE_KEY){
    return res.status(501).json({ ok: false, reason: 'not_configured' });
  }
  const body = readBody(req);
  if(!body || typeof body !== 'object'){
    return res.status(400).json({ ok: false, error: 'bad json' });
  }

  const sb = await getClient();

  if(body.unsub){
    const endpoint = body.sub && typeof body.sub.endpoint === 'string' ? body.sub.endpoint : null;
    if(endpoint){
      if(sb){
        await sb.from('push_subs').delete().eq('endpoint', endpoint);
      }else{
        memSubs.delete(endpoint);
      }
    }
    return res.status(200).json({ ok: true, count: await subCount(sb) });
  }

  const s = body.sub;
  if(!s || typeof s.endpoint !== 'string' || typeof s.p256dh !== 'string' || typeof s.auth !== 'string'){
    return res.status(400).json({ ok: false, error: 'sub {endpoint,p256dh,auth} required' });
  }
  const threshold = (body.threshold && typeof body.threshold === 'object' && body.threshold.price > 0)
    ? { p: String(body.threshold.p), c: String(body.threshold.c), price: Number(body.threshold.price) }
    : null;

  if(sb){
    const { error } = await sb.from('push_subs').upsert({
      endpoint: s.endpoint,
      p256dh: s.p256dh,
      auth: s.auth,
      crop: threshold ? threshold.c : null,
      province: threshold ? threshold.p : null,
      threshold_price: threshold ? threshold.price : null
    });
    if(error) return res.status(500).json({ ok: false, error: 'upsert failed' });
    return res.status(200).json({ ok: true, count: await subCount(sb), updated: false });
  }

  const existing = memSubs.get(s.endpoint);
  memSubs.set(s.endpoint, { sub: { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }, threshold });
  while(memSubs.size > MAX_SUBS){
    const oldest = memSubs.keys().next().value;
    if(oldest === undefined) break;
    memSubs.delete(oldest);
  }
  return res.status(200).json({ ok: true, count: memSubs.size, updated: !!existing });
};

/*
  Cron helper (used by api/push-check.js): for every registered subscription
  with a threshold, fetch current prices once and notify when the target is
  crossed (current price >= threshold). One-shot: the threshold is cleared
  after a successful send. 404/410 = expired subscription — dropped.
*/
async function sendPushes(fetchPrices){
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if(!pub || !priv) return { sent: 0, checked: 0, note: 'VAPID keys not configured' };
  let webpush = null;
  try{ webpush = require('web-push'); }
  catch{ return { sent: 0, checked: 0, note: 'web-push not installed (bun add web-push)' }; }
  webpush.setVapidDetails('mailto:harvest@example.com', pub, priv);

  const sb = await getClient();
  let entries = [];
  if(sb){
    const { data, error } = await sb.from('push_subs')
      .select('endpoint,p256dh,auth,crop,province,threshold_price')
      .not('threshold_price', 'is', null)
      .limit(MAX_SUBS);
    if(!error && data){
      entries = data
        .filter(r => r.threshold_price !== null)
        .map(r => ({
          sub: { endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth },
          threshold: { p: r.province, c: r.crop, price: Number(r.threshold_price) }
        }));
    }
  }else{
    for(const [endpoint, entry] of memSubs){
      if(entry.threshold) entries.push({ endpoint, ...entry });
    }
  }
  if(!entries.length) return { sent: 0, checked: 0 };

  const prices = await fetchPrices(); // [{crop, prov, price, unit, ...}]
  let sent = 0, checked = 0;
  for(const entry of entries){
    const th = entry.threshold;
    checked++;
    const cur = prices.find(x => x.crop === th.c && x.prov === th.p);
    if(!cur || !(cur.price >= th.price)) continue;
    const payload = JSON.stringify({
      title: 'Harvest Trend · รู้ทันราคา',
      body: th.c + ' (' + th.p + ') ถึงเป้าหมาย ' + th.price + ' บาท — ตอนนี้ ' + cur.price + ' บาท'
    });
    try{
      await webpush.sendNotification(entry.sub, payload);
      sent++;
      if(sb){
        await sb.from('push_subs').update({ threshold_price: null }).eq('endpoint', entry.sub.endpoint);
      }else if(memSubs.has(entry.sub.endpoint)){
        memSubs.get(entry.sub.endpoint).threshold = null;
      }
    }catch(err){
      if(err && (err.statusCode === 404 || err.statusCode === 410)){
        if(sb){
          await sb.from('push_subs').delete().eq('endpoint', entry.sub.endpoint);
        }else{
          memSubs.delete(entry.sub.endpoint);
        }
      }
    }
  }
  return { sent, checked };
}

module.exports.sendPushes = sendPushes;
module.exports._internals = { subs: memSubs }; // memory fallback / debug
