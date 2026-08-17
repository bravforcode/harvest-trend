# Web Push — Setup Guide (Harvest Trend · รู้ทันราคา)

End-to-end scaffold for browser push notifications: a client toggle
(`src/components/PushToggle.tsx`), a subscription API (`api/push.js`), a daily
cron (`api/push-check.js` via `vercel.json` crons) and a VAPID keygen script
(`scripts/gen-vapid.mjs`). Everything is env-gated — until you set the VAPID
keys, the client toggle renders nothing and both APIs answer `501
{reason:'not_configured'}`.

## 1. Install the dependency

```sh
bun add web-push
```

(Note: the code lazy-loads `web-push` inside `try/catch`, so the app and tests
keep working before this step. `scripts/gen-vapid.mjs` prints this same
instruction if the package is missing.)

## 2. Generate VAPID keys (one pair per deployment)

```sh
node scripts/gen-vapid.mjs
```

The script prints a public key and a private key (P-256/ECDSA). Keep the
private key secret — anyone holding it can push to your subscribers.

## 3. Set environment variables

Vercel dashboard → Project → Settings → Environment Variables, or:

```sh
vercel env add VITE_VAPID_PUBLIC_KEY   # build-time, read by the client bundle
vercel env add VAPID_PUBLIC_KEY        # runtime, read by api/push-check.js
vercel env add VAPID_PRIVATE_KEY       # runtime, read by api/push.js
```

Add them for Production, Preview and Development as needed.

## 4. Deploy

```sh
vercel deploy --prod
```

Deploying also registers the cron (`"crons": [{ "path": "/api/push-check",
"schedule": "0 0 * * *" }]` in `vercel.json`). Only Production is eligible for
cron on Vercel's Hobby plan.

## 5. Enable in the browser

1. Open the app on the LINE page (`/line`).
2. The "แจ้งเตือนผ่านมือถือ / Push notifications" card appears (only when
   `VITE_VAPID_PUBLIC_KEY` is set at build time).
3. Tap **เปิดการแจ้งเตือน / Enable** → the browser permission prompt → allowed.
4. The subscription is POSTed to `/api/push` and the toast "ตั้งค่าสำเร็จ /
   Saved" confirms.
5. iOS Safari: install the app to the home screen first (see the card subtitle).

To test the cron locally, simulate Vercel's caller:

```sh
curl -H "User-Agent: vercel-cron/1.0" https://your-app.vercel.app/api/push-check
```

## Storage (2026-08-17 update — shared store live)

Subscriptions are stored in **Supabase `push_subs`** (server-managed, RLS
denies all clients, accessed with the service role via `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY`) — durable across cold starts and serverless
instances. The module-level `Map` in `api/push.js` remains **only as a
fallback** when those env vars are missing.

Threshold matching resolves a province the same way the client does
(`currentPriceFor`): exact live price → region live (`rg:north` …) → national
(`*`) → seasonal model estimate. This fixed a bug where province-scoped
thresholds never fired because live prices are region-scoped.

Remaining honest limits:
- `MAX_SUBS = 100` per refresh batch (cron reads with `.limit(100)`).
- The daily cron is one-shot per day (Vercel Hobby plan); price crossings
  between runs are only caught on the next run.
- `VAPID_*` keys are normalized in code (trailing `\r\n"` from the dashboard
  paste no longer breaks `web-push` — verified against prod 2026-08-17).

## 6. Push events in the service worker (future work)

The service worker is **generated** by `vite-plugin-pwa` (workbox `generateSW`,
see `vite.config.ts`) — it has no push handler, and generateSW cannot add one.
To receive notifications you must switch to **injectManifest** mode and add a
`sw.js` source with:

```js
self.addEventListener('push', e => {
  const d = e.data.json();
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: '/icon-192.png' }));
});
```

That requires changing `VitePWA({ ... })` in `vite.config.ts` to
`injectManifest` + `src/sw.js` — deliberately **left as future work** in this
scaffold. Until then, the client can subscribe and the server can send, but
the browser will not display anything (the push is delivered and dropped).
