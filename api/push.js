/*
  Harvest Trend · รู้ทันราคา — web push subscription registry (Vercel serverless).

  POST /api/push
    { sub: { endpoint, p256dh, auth }, threshold?: { p, c, price } }  → register
    { unsub: true, sub: { endpoint } }                                → remove

  HONEST STORAGE NOTE: subscriptions live in a module-level Map, i.e. IN-MEMORY
  and per serverless instance. Vercel functions are ephemeral: cold starts lose
  the Map, and each warm instance only knows its own subscribers. Production
  needs a shared store (Vercel KV / Upstash Redis or Supabase) — deliberately
  NOT added here to keep zero runtime deps; see docs/PUSH-SETUP.md for the path.

  Exports sendPushes(fetchPrices) for the daily cron (api/push-check.js).
*/
'use strict';

const MAX_SUBS = 100;
const subs = new Map(); // endpoint -> { sub: {endpoint,p256dh,auth}, threshold: {p,c,price}|null }

/* read a Vercel-parsed request body (string | Buffer | pre-parsed object —
   same convention as api/line-webhook.js) */
function readBody(req){
  let raw;
  if(typeof req.body === 'string') raw = req.body;
  else if(Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else if(req.body && typeof req.body === 'object') raw = JSON.stringify(req.body);
  else raw = '';
  try{ return JSON.parse(raw); }catch{ return null; }
}

module.exports = async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({ error: 'method not allowed' });
  }
  /* without a server-side VAPID key we could store subs but never notify —
     fail fast so the client can tell the user the feature is not configured */
  if(!process.env.VAPID_PRIVATE_KEY){
    return res.status(501).json({ ok: false, reason: 'not_configured' });
  }
  const body = readBody(req);
  if(!body || typeof body !== 'object'){
    return res.status(400).json({ ok: false, error: 'bad json' });
  }

  /* unsubscribe: delete by endpoint, if we know it */
  if(body.unsub){
    if(body.sub && typeof body.sub.endpoint === 'string') subs.delete(body.sub.endpoint);
    return res.status(200).json({ ok: true, count: subs.size });
  }

  const s = body.sub;
  if(!s || typeof s.endpoint !== 'string' || typeof s.p256dh !== 'string' || typeof s.auth !== 'string'){
    return res.status(400).json({ ok: false, error: 'sub {endpoint,p256dh,auth} required' });
  }
  const existing = subs.get(s.endpoint);
  const threshold = (body.threshold && typeof body.threshold === 'object' && body.threshold.price > 0)
    ? { p: String(body.threshold.p), c: String(body.threshold.c), price: Number(body.threshold.price) }
    : null;
  subs.set(s.endpoint, { sub: { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }, threshold });
  /* cap at MAX_SUBS: if the map outgrew it during this instance's life, drop
     the oldest entries (Map iteration = insertion order) to stay bounded */
  while(subs.size > MAX_SUBS){
    const oldest = subs.keys().next().value;
    if(oldest === undefined) break;
    subs.delete(oldest);
  }
  return res.status(200).json({ ok: true, count: subs.size, updated: !!existing });
};

/*
  Cron helper (used by api/push-check.js): for every registered subscription
  with a threshold, fetch current prices once and notify when the target is
  crossed (current price >= threshold). 'web-push' is required lazily inside
  try/catch so this file stays loadable (and testable) without the dependency.
*/
async function sendPushes(fetchPrices){
  if(!subs.size) return { sent: 0, checked: 0 };
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if(!pub || !priv) return { sent: 0, checked: 0, note: 'VAPID keys not configured' };
  let webpush = null;
  try{ webpush = require('web-push'); }
  catch{ return { sent: 0, checked: 0, note: 'web-push not installed (bun add web-push)' }; }
  webpush.setVapidDetails('mailto:harvest@example.com', pub, priv);

  const prices = await fetchPrices(); // [{crop, prov, price, unit, ...}]
  let sent = 0, checked = 0;
  for(const [endpoint, entry] of subs){
    const th = entry.threshold;
    if(!th) continue; // no alert configured
    checked++;
    const cur = prices.find(x => x.crop === th.c && x.prov === th.p);
    if(!cur || !(cur.price >= th.price)) continue; // not crossed yet
    const payload = JSON.stringify({
      title: 'Harvest Trend · รู้ทันราคา',
      body: th.c + ' (' + th.p + ') ถึงเป้าหมาย ' + th.price + ' บาท — ตอนนี้ ' + cur.price + ' บาท'
    });
    try{
      await webpush.sendNotification(entry.sub, payload);
      entry.threshold = null; // one-shot alert: don't re-send on the next daily run
      sent++;
    }catch(err){
      /* 404/410 = subscription expired or unsubscribed elsewhere — drop it */
      if(err && (err.statusCode === 404 || err.statusCode === 410)) subs.delete(endpoint);
    }
  }
  return { sent, checked };
}

module.exports.sendPushes = sendPushes;
module.exports._internals = { subs }; // tests/debug
