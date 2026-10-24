# Label audit: simulated and live data on every page

Task A6 (grant readiness plan, finding F5). Scope: every route in `src/App.tsx`
that renders a price or a signal. Date: 2026-10-24.

Method: `grep -rln "getPrice\|verdict\|recommend(\|priceSub\|chart" src/pages src/components`
(recorded below), then manual read of every route and of the components each
route renders, because the grep misses some files (for example `PriceMapPage`,
`ThresholdPanel`, `ReportPage`, `SeasonCalendar`).

Grep hits: `CostCalcPage`, `HomePage`, `LinePage`, `PriceChartPage`, `WatchPage`,
`PriceChart`, `SignalList`, `VerdictCard`, plus `BottomNav` and `Header`
(false hits: the nav link `/chart` and the `LineChart` icon, no price shown).

## Route table

Status is after the change. "Label key" is the i18n key that carries the label.

| Route | Page file (and components) | Price or signal shown | Label present before | Label key (before) | Label present after | Label key (after) |
|---|---|---|---|---|---|---|
| `/` | `HomePage.tsx`, `VerdictCard.tsx`, `SellCalendar.tsx` | Verdict price, 4 signals | No per-value label. Only the global `LiveBadge`, which reflects `LiveData.ok` and not the province | none | Yes | `lbLiveTitle` / `lbOffTitle` per value |
| `/` | `SellCalendar.tsx` | Best selling month (seasonal model) | Yes | `sellSub` ("from seasonal model") | Yes | unchanged |
| `/chart` | `PriceChartPage.tsx`, `PriceChart.tsx`, `SignalList.tsx`, `SeasonCalendar.tsx` | Chart, stats, 4 signals, season bars | Yes | `chartNote`, `priceSubTpl` / `livePriceSubTpl`, `LiveBadge` | Yes | unchanged (see uncertainty 1 and 3) |
| `/map` | `PriceMapPage.tsx` | Province price choropleth, tooltip prices | Yes | `mapNote` on page, `mapLive` / `mapModel` tag per province | Yes | unchanged |
| `/cost` | `CostCalcPage.tsx` | "Current price" and profit or loss vs break-even | No. The official cost block is sourced to data.go.th and is not simulated | none | Yes | `lbLiveTitle` / `lbOffTitle` under current price |
| `/watch` | `WatchPage.tsx`, `ThresholdPanel.tsx`, `VerdictCard.tsx` (compact) | Watchlist price per row, alert "current price", compare cards | No | none | Yes | `lbLiveTitle` / `lbOffTitle` per row, per alert, and per compare card (via VerdictCard) |
| `/report` | `ReportPage.tsx` | Estimate price in the "use estimate" quick-fill button | No. `repQuick` ("use estimate ~X") does not say simulated | none | Yes | `lbLiveTitle` / `lbOffTitle` next to the button |
| `/about` | `AboutPage.tsx` | No price or signal | n/a | n/a | n/a | n/a |
| `/line` | `LinePage.tsx` | Simulated bot chat replies with price and verdict | Yes | `demoTitle` ("simulated"), `demoSub` ("mock data") | Yes | unchanged |

## Changes made

- `src/components/VerdictCard.tsx`: reads `LiveData.get(crop, prov)`; shows
  `lbLiveTitle` when a live entry with price > 0 exists, else `lbOffTitle`,
  next to the price. Used on Home and on Watch compare cards.
- `src/pages/WatchPage.tsx`: same tag next to each watchlist row price.
- `src/components/ThresholdPanel.tsx`: `Row` gains `live: boolean`; the
  "current price" line gets the same tag. The engine and the thresholds are not
  changed.
- `src/pages/CostCalcPage.tsx`: tag under the "current price" value.
- `src/pages/ReportPage.tsx`: tag next to the "use estimate" button.

No i18n keys were added or changed. The tags reuse `lbLiveTitle` and
`lbOffTitle`, which already exist in `th` and `en`, and which `LiveBadge`
already uses for the same two statuses.

## Verification

- `bun run build`: exit 0
- `bun run test`: exit 0, no `✗` lines
- `node_modules/.bin/tsc --noEmit -p tsconfig.json`: exit 0 (no file emitted)

## Uncertainty

1. `PriceChartPage` shows `chartNote` ("simulated data ... not real market
   prices") under the chart even when live anchoring is on. The subtitle
   switches to `livePriceSubTpl`, so the page says both. Left unchanged, since
   the page is already labelled and the wording is outside this task.
2. `LiveBadge` is global. It reads "live" whenever any official price is
   loaded, so on Home it can say live while a province without official data
   shows a model value. The per-value tags added above cover the audited
   components. The badge itself is not changed.
3. `SeasonCalendar` (chart page) has no per-card label. Its subtitle
   ("seasonal price level") does not say "model". It sits under the page-level
   `chartNote` and `LiveBadge`. Left unchanged.
4. The server-side LINE bot (`api/`) is out of scope and not audited here.
   `LinePage` is labelled as a simulated demo.
5. The plan's Interfaces list names `mockNote`, `chartNote`, `liveNote` and
   `mapNote`. These are long sentences. Per-value tags need a short status
   label, so the existing `lbLiveTitle` / `lbOffTitle` pair was used instead.
6. No new test was added. The task limits file edits to the page and component
   files, and `tests/ui-contract.test.js` checks key presence only. Visual
   placement was not checked in a browser.
