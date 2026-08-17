# Product

<!-- impeccable:product-schema 1 -->

## Platform

web — mobile-first PWA (static site, service worker + manifest, runs offline; no runtime dependencies; optional Vercel serverless `/api` for live prices + LINE webhook).

## Users

Primary: Thai farmers in any of 77 provinces, working at the farm (front-of-orchard · หน้าสวน), low technology familiarity, making a same-day decision: when to harvest and sell. Job: get today's plain-language verdict for their province + crop in 2 taps, without needing expertise.

## Product Purpose

Harvest Trend (รู้ทันราคา) is a real-use tool — not a pitch — for checking today's farm-gate price signal and getting a harvest/sell timing recommendation with reasons. Success: a farmer picks province → picks crop → reads a clear verdict with why, in 2 taps, offline, in Thai or English.

## Positioning

"Know before selling" — blends 4 signals (price momentum 40%, seasonal supply 25%, harvest timing 20%, weather 15%) into 3 plain verdict levels with reasons, from a deterministic engine that a neighboring product could not truthfully copy as "their own data". Refuses the demo-dashboard pattern: the picker + verdict are the whole first screen.

## Operating Context

- Mobile-first, single column; works inside in-app browsers (LINE/Facebook/Instagram) except geolocation, which those block — the app tells the user instead of silently failing.
- 3-step flow: province picker (search / 6 regions / GPS) → crop chips (10 crops, main-production areas first) → verdict card with reasons + confidence from 4 signals.
- Secondary pages: 26-week price chart + 4-week forecast, watchlist, farmer price report, LINE OA bot page, about.
- Data: deterministic mock engine for most province/crop combinations, clearly labeled as simulated; live prices from government sources (BOT tables via `/api`, updated automatically; data.go.th CKAN sources are blocked from Vercel's datacenter IPs and retried with UA rotation — documented in `api/prices.js`); watchlist + reports saved in localStorage AND synced to Supabase when configured (reports are public, stored in Singapore, no GPS collected).
- LINE OA webhook (`api/line-webhook.js`) answers messages like "ราคา ระยอง ทุเรียน" with flex replies; join events get a group greeting.
- PWA: service worker is network-first (cache is only an offline fallback), manifest with PNG + SVG icons, Thai/EN language toggle, adjustable font size (A− / A+).

## Capabilities and Constraints

- 77 provinces across 6 regions; 25 crops: durian, rubber, cassava, rice, maize, sugarcane, oil palm, rambutan, mangosteen, longan, pork, egg, broiler, beef, shrimp, tilapia, raw milk, coffee, coconut, pineapple, onion, shallot, garlic, mango, banana.
- Verdict in 3 levels + confidence from 1–4 signals; grades A–D for durian pricing.
- Static site with zero runtime dependencies; Node >= 18 only for tests; no build step.
- Data honesty is a product constraint: simulated data is always labeled; live government data is labeled with a source chip (`.live-src`).
- Undecided: production domain for absolute canonical/sitemap URLs; real LINE OA credentials + QR; scope of data licensing beyond the cited sources.

## Brand Commitments

- Name: **Harvest Trend** (รู้ทันราคา), alternate AgriTrend EEC.
- Binding visual identity (per DIRECTION CONTRACT v2 — "unchanged world"): *Warm orchard ledger* — cream ground, forest ink, harvest gold for what is yet to come, clay for decide-now; Kanit over Plex Sans Thai (implemented as Sarabun + Noto Sans Thai); leaf-line SVG grammar; paper panels on hairline seams. Theme tokens must stay identical across all pages.
- Voice: plain, farmer-first Thai; labels the prototype honestly (mock data · not financial advice).
- SDG framing (1, 2, 8, 12) in the footer; EEC-SDG Hackathon & Pitching 2026 · Track 5 Smart Agriculture & Food Security.

## Evidence on Hand

- DIRECTION CONTRACT v2 comment block at the top of every page (thesis / own-world / story / form).
- `about.html`: origin story (durian glut 2026 — output 1,066,980 t, +22.4%, grade C ~170 → ~95 THB/kg) + source list (doae.go.th, thairath.co.th, thaipbs.or.th, prachachat).
- Live-price integration: `api/prices.js` (BOT tables, data.go.th), `api/line-webhook.js`; `tests/` — 51 checks passing.
- Absences that future work must not fabricate: no real price history beyond the cited sources; no production domain (deployed at harvest-ecc.vercel.app as a Vercel preview/stable URL). LINE OA @441sptre IS real and configured (webhook returns `status: ok`); watchlist sync is keyed on LINE Login `sub` (server does not re-verify the id_token on every write — documented in `api/watch-sync.js`).

## Product Principles

1. **Real-use tool, not a pitch** — the task (pick → verdict) owns the first screen; no demo dashboard.
2. **2 taps, plain language, no expertise required** — a verdict with reasons, not a raw number dump.
3. **Data honesty** — label simulated vs live, cite sources, disclaim as non-financial advice.
4. **Local-first and offline** — watchlist/reports stay on-device; the PWA works without a network.
5. **Inclusive by default** — Thai+EN, adjustable font size, keyboard/AT-visible focus, reduced-motion respected.

## Accessibility & Inclusion

- Thai+EN toggle; adjustable font size (A− / A+); skip-link; focus-visible rings; `aria-live` on verdict updates; `prefers-reduced-motion` honored.
- Contrast-conscious palette (moss/gold on cream verified ≥4.5:1 for body text); SVG icon grammar (no emoji-as-icon); ≥44px touch targets on interactive chips.
