/*
  Harvest Trend · รู้ทันราคา — CKAN mirror (Cloudflare Worker).

  Endpoints:
    GET  /            health (updated_at, per-resource counts, errors)
    GET  /snapshot    full mirror snapshot as JSON (what api/prices.js reads)
    POST /refresh     trigger an immediate refresh (optional X-Refresh-Token)
  Cron:   wrangler.toml [triggers] — refreshes the KV snapshot on schedule.

  KV binding: CKAN_KV (see wrangler.toml). The snapshot is written atomically
  (one put) so a partial upstream failure never corrupts the previous one.
*/
import { buildSnapshot, RESOURCE_IDS } from './core.mjs';

function json(body, status = 200, extraHeaders = {}){
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders }
  });
}

async function readMeta(kv){
  try{
    const raw = await kv.get('meta');
    return raw ? JSON.parse(raw) : null;
  }catch{ return null; }
}

async function writeMeta(kv, snapshot){
  await kv.put('meta', JSON.stringify({
    updated_at: snapshot.updated_at,
    counts: snapshot.counts,
    errors: snapshot.errors
  }));
}

export default {
  /* scheduled refresh (cron in wrangler.toml) — never blocks a request */
  async scheduled(event, env, ctx){
    ctx.waitUntil((async () => {
      try{
        const snapshot = await buildSnapshot({ kv: env.CKAN_KV });
        await writeMeta(env.CKAN_KV, snapshot);
      }catch(e){ /* cron failure is logged by the platform; old KV stays */ }
    })());
  },

  async fetch(request, env){
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if(path === '/' || path === '/health'){
      const meta = await readMeta(env.CKAN_KV);
      return json({
        ok: true,
        service: 'harvest-ckan-mirror',
        resources: RESOURCE_IDS.length,
        updated_at: meta ? meta.updated_at : null,
        counts: meta ? meta.counts : null,
        errors: meta ? meta.errors : []
      });
    }

    if(path === '/snapshot'){
      const raw = await env.CKAN_KV.get('snapshot');
      if(!raw) return json({ ok: false, error: 'snapshot not ready yet — wait for the first cron tick or POST /refresh' }, 503);
      return json(JSON.parse(raw), 200, { 'Cache-Control': 'public, max-age=600' });
    }

    if(path === '/refresh'){
      if(request.method !== 'POST') return json({ ok: false, error: 'POST required' }, 405);
      const token = env.REFRESH_TOKEN;
      if(token && request.headers.get('x-refresh-token') !== token){
        return json({ ok: false, error: 'forbidden' }, 403);
      }
      /* rate-limit: at most one refresh per 5 minutes even with the token,
         so an anonymous caller can't spam data.go.th or burn KV writes */
      const last = await env.CKAN_KV.get('last_refresh');
      if(last && Date.now() - Number(last) < 5 * 60 * 1000){
        return json({ ok: false, error: 'refresh rate-limited (once per 5 min)' }, 429);
      }
      /* lock first (blocks concurrent spam), release on failure so a legit
         retry isn't stuck behind a failed refresh */
      await env.CKAN_KV.put('last_refresh', String(Date.now()));
      try{
        const snapshot = await buildSnapshot({ kv: env.CKAN_KV });
        await writeMeta(env.CKAN_KV, snapshot);
        return json({ ok: true, updated_at: snapshot.updated_at, counts: snapshot.counts, errors: snapshot.errors });
      }catch(e){
        await env.CKAN_KV.delete('last_refresh');
        return json({ ok: false, error: (e && e.message) || String(e) }, 500);
      }
    }

    return json({ ok: false, error: 'not found' }, 404);
  }
};
