# harvest-ckan-mirror — data.go.th CKAN mirror (Cloudflare Worker)

**Why:** `data.go.th` (Thai government CKAN open-data portal) sits behind a
Cloudflare WAF that intermittently returns **HTTP 403 to datacenter IPs** —
verified 2026-08-17: the same CKAN URL returns `success:true` from a
residential IP but `HTTP 403` from Vercel's function IPs. The Vercel-side
mitigations (UA rotation, retries, BOT-first) keep the app alive but lose
most provincial CKAN datasets.

**Fix:** this worker runs **on Cloudflare's own network**, fetches every CKAN
dataset consumed by `api/prices.js`, paginates it, and stores the raw records
in a Cloudflare KV snapshot. `api/prices.js` then reads the mirror first and
only falls back to direct fetching when the mirror is unreachable.

## Deploy

```bash
npx wrangler login

# 1. create the KV namespace and paste its id into wrangler.toml
npx wrangler kv namespace create CKAN_KV

# 2. (optional) set a refresh token secret instead of the [vars] plaintext
npx wrangler secret put REFRESH_TOKEN

# 3. deploy
npx wrangler deploy
```

Take note of the deployed URL (printed by `wrangler deploy`, e.g.
`https://harvest-ckan-mirror.<subdomain>.workers.dev`).

## Verify

```bash
# warm the snapshot immediately (first cron tick can be up to 6h away)
curl -X POST https://<worker-url>/refresh

# health + counts
curl https://<worker-url>/

# the full snapshot api/prices.js will read
curl https://<worker-url>/snapshot | head -c 500
```

## Wire into Vercel

1. In the Vercel dashboard (or `vercel env add CKAN_MIRROR_URL production`),
   set:

   ```
   CKAN_MIRROR_URL = https://harvest-ckan-mirror.<subdomain>.workers.dev
   ```

2. Deploy the Vercel app. `api/prices.js` now tries, in order:
   1. **mirror** (`GET {CKAN_MIRROR_URL}/snapshot`) — raw records from KV
   2. **direct data.go.th** — only if the mirror is unreachable
   3. **BOT (ธปท.)** — always runs, never gated by the deadline

The API response includes `mirror: "up" | "down" | "off"` so you can tell at a
glance which path served the data.

## Notes

- **KV budget:** 26 datasets, each a few hundred records max. The snapshot is
  a single KV value written atomically; a partial upstream failure never
  corrupts the previous snapshot.
- **Sync:** the `RESOURCE_IDS` list in `src/core.mjs` mirrors the datasets in
  `api/prices.js`. If datasets are added/removed there, update both. A
  mismatch is never fatal — the missing resource simply falls back to direct
  fetch.
- **Test locally:** `node tests/ckan-mirror.test.mjs` (runs the core fetch /
  snapshot logic against a fake fetcher; no Cloudflare runtime needed).
- **Costs:** free-tier friendly — 4 cron ticks/day. Subrequest budget measured on real data (2026-08-17): 28 subrequests per refresh (26 datasets; only 2 exceed 100 rows → 2 pages each), well under the free-plan cap of 50 subrequests per invocation.
