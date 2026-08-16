/*
  Harvest Trend · รู้ทันราคา — Vercel cron entry for web push alerts (daily).

  GET /api/push-check — guarded to Vercel cron traffic only (user-agent
  'vercel-cron/1.0' or the x-vercel-cron header; plain curl hits get 403).

  HONEST LIMITATION: subscriptions live in the in-memory Map of the serverless
  instance that registered them (see api/push.js). A cron invocation is routed
  to an ARBITRARY warm instance, so it only ever sees the subs that instance
  registered itself. Until subscriptions move to shared storage (Vercel KV /
  Supabase — see docs/PUSH-SETUP.md), alerts fire only for subscribers that
  happen to share the same warm instance, and cold starts lose everything.
  This is a scaffold, not a production notification pipeline.
*/
'use strict';
const { fetchPrices } = require('./prices.js');
const { sendPushes } = require('./push.js');

module.exports = async function handler(req, res){
  if(req.method !== 'GET' && req.method !== 'HEAD'){
    return res.status(405).json({ error: 'method not allowed' });
  }
  /* Vercel cron calls set user-agent 'vercel-cron/1.0' (and the
     x-vercel-cron header) — accept either, reject everything else */
  const ua = req.headers['user-agent'] || '';
  if(ua !== 'vercel-cron/1.0' && !req.headers['x-vercel-cron']){
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  if(!process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_PUBLIC_KEY){
    return res.status(501).json({ ok: false, reason: 'not_configured' });
  }
  try{
    const r = await sendPushes(fetchPrices);
    return res.status(200).json({ ok: true, sent: r.sent, checked: r.checked, note: r.note || null });
  }catch(e){
    return res.status(502).json({ ok: false, error: e && e.message || String(e) });
  }
};
