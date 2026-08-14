# 2026-08-15 · UI-Hardening Implementation Plan

Branch: `feat/ui-hardening-impl` (worktree `ui-hardening-impl`)
Status: APPROVED — execute via subagent-driven development (implementer → spec review → quality review per task).

## Scope

Professional functional UX/UI improvements for Harvest Trend (รู้ทันราคา), adapted **conceptually** from deep-research of
reactbits.dev, magicui.design, ui.aceternity.com/components, coss.com/ui (4 parallel researcher audits, 2026-08-15, evidence
fetched — summaries in the task specs below; full reports were returned to the session).

## Hard constraints (from PRODUCT.md + DIRECTION CONTRACT v2 + user mandate)

1. **Theme tokens must stay identical** — `assets/styles.css :root` block (lines 8–26) MUST NOT change. All new CSS is
   additive, appended at the bottom of `styles.css` (existing convention: "Only additive, theme-consistent rules may be
   appended at the bottom"), using only existing tokens (`--ground --paper --ink --forest --leaf --gold --gold-soft --clay
   --clay-soft --sky --sky-soft --moss --line --leaf-tint --shadow-soft --shadow-lift --r-sm --r-md --r-lg`) or `rgba()`
   derivations of them. NO new hex colors.
2. **Zero runtime dependencies** — vanilla HTML/CSS/JS only. No React, no Tailwind, no libs. (Conceptual adaptation only;
   no copying of component source. Licensing verified: ReactBits free MIT+Commons Clause, MagicUI free MIT, Aceternity
   license permits end products, COSS packages/ui is AGPL — we never copy code anyway.)
3. **Thai-safe motion** — no per-character text animation (breaks Thai combining marks). Word-level or element-level only.
4. **Reduced motion** — every new animation gated by `@media (prefers-reduced-motion: reduce)`.
5. **Mobile-first, low-end safe** — no WebGL/canvas full-screen backgrounds, no hover-only primary UX, no continuous rAF
   loops. 44px+ touch targets (coarse-pointer expansion for small icon buttons).
6. **i18n parity** — every new user-visible string added to BOTH `T.th` and `T.en` in `assets/app.js`.
7. **Data honesty** — any new displayed numbers must come from existing engine (`signals()`, `priceSeriesFor()`,
   `LiveData`); live vs simulated labeling via existing badge/chip mechanisms.
8. **A11y preserved** — keep skip-link, focus-visible rings, aria-live, aria-pressed; new controls get proper roles/labels.

## Files

| File | Task | Note |
|---|---|---|
| assets/styles.css | 1 | additive only; tokens untouched |
| assets/app.js | 2 | shared helpers + i18n keys |
| rutun-price.html | 3 | home |
| price-chart.html | 4 | chart |
| watch.html | 5 | watchlist |
| report.html | 6 | report |
| line.html | 7 | LINE page (brand-mark fix) |
| about.html | 7 | EN aboutTitle fix |
| sw.js | 8 | CORE + line.html, cache bump v9→v10 |
| tests/ui-contract.test.js | 9 | NEW regression guard |

## Task 1 — Design-system layer (`assets/styles.css`, additive)

Append at bottom, section-commented with evidence notes. All new rules use existing tokens only.

- **1.1 Press feedback (ReactBits SpecularButton.css, COSS button)**: `.btn:active, .reg-chip:active, .prov-item:active, .crop-chip:active, .grade-btn:active, .gps-btn:active, .fontbtn:active, .lang-btn:active, .watch-chip button:active, .rep-del:active { transform: scale(.97); }` (skip where transform conflicts; use `.btn:not(:disabled):active` guard).
- **1.2 COSS surface system**: 1px inset top highlight + tinted shadow on `.btn-gold, .btn-forest, .btn-warn` via `::before` overlay + `box-shadow`; press swaps highlight to dark + drops shadow. Must NOT break existing hover rules (they live on the same classes — combine via extra specificity, e.g. `.btn-gold::before`).
- **1.3 Shine sweep (ShinyText/MagicUI AnimatedShinyText)**: `.shine` utility — `background: linear-gradient(120deg, transparent 40%, rgba(255,253,246,.85) 50%, transparent 60%)`, `background-size: 200% 100%`, `background-clip: text`, `color: transparent` variant `.shine-gold` for gold-on-dark; `@keyframes shineSweep { background-position 100%→-100% }` 8s infinite linear (dwell via 0%,90%,100% keyframe trick); gate under reduced-motion (freeze at start).
- **1.4 Rotating gold ring CTA (Aceternity MovingBorder / MagicUI ShineBorder)**: `.ring-cta` — absolutely-positioned `::before` conic-gradient (gold→clay→gold) rotating via `@keyframes` (transform rotate, compositor-friendly), masked to a border ring (`mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude; padding: 2px`), inner content on top; freeze rotation under reduced-motion (static gradient ring). Applied to the primary home CTA only.
- **1.5 Static orchard dot texture (Aceternity GridAndDot static / MagicUI DotPattern static)**: `.hero` gets a `::after` dot grid `background-image: radial-gradient(rgba(201,146,46,.14) 1px, transparent 1px); background-size: 18px 18px` with a radial mask fade; z-index below hero content (hero already `isolation:isolate`). Zero runtime cost, no JS. Also a body-level option: skip body-level to keep pages exactly as-is.
- **1.6 3-layer input shadow + autofill kill-switch (Aceternity signup-form --shadow-input, COSS input)**: on `.field input, .field textarea, .search-box, .qc-row select, .chat-input-row input`: `box-shadow: 0 2px 3px -1px rgba(28,46,32,.08), 0 1px 0 0 rgba(255,253,246,.6), 0 0 0 1px rgba(28,46,32,.06)`; autofill fix: `transition: background-color 5000000s ease-in-out 0s` + `-webkit-text-fill-color: var(--ink)` on autofill. Keep existing focus-within border rules.
- **1.7 Toast variants + slide (COSS toast semantics)**: `#toast.ok { background: var(--forest) }`, `#toast.err { background: var(--clay) }`, default stays `--ink`; add small icon slot (`.toast-icon`), slide-up entrance keyframe already exists — add `.toast-fresh` class to replay animation on dedupe refresh.
- **1.8 Skeleton shimmer (COSS skeleton / MagicUI)**: `.skel` — `background: linear-gradient(120deg, transparent 40%, rgba(255,253,246,.9) 50%, transparent 60%) var(--leaf-tint); background-size: 200% 100%;` `@keyframes skelSweep { to { background-position: -200% 0 } }` `animation: skelSweep 2s -1s infinite linear`; reduced-motion → `animation: none`.
- **1.9 Empty-state anatomy (COSS Empty)**: `.empty-box` (centered icon circle `.empty-ic` using gold-soft bg + gold icon, `.empty-tt`, `.empty-ds`, `.empty-act` button slot).
- **1.10 Segmented sliding pill (Aceternity Tabs)**: `.seg` container + `.seg-pill` absolute element (moved via JS transform) + `.seg-btn.active` text color swap; hidden pill fallback if JS fails (active button still styled).
- **1.11 Ticker marquee (MagicUI Marquee)**: `.ticker` — flex row, `animation: tickerMove 30s linear infinite` with `@keyframes tickerMove { to { transform: translateX(calc(-50% - var(--ticker-gap, 12px))) } }`, duplicate content twice for seam; `.ticker-fade` edge masks (gradient overlays, pointer-events-none); pause under reduced-motion + `.ticker-paused` class when offscreen (JS).
- **1.12 Sparkline**: `.spark` svg sizing (height 24px, width 64px).
- **1.13 Coarse-pointer hit areas (COSS)**: `@media (pointer: coarse)` — `.watch-chip button, .rep-del` get `position:relative` + `::after { content:''; position:absolute; inset:-10px }` (44px effective). Verify existing buttons already ≥44px (prov-item, crop-chip are).
- **1.14 Reveal-on-scroll (ReactBits FadeContent)**: `.rv { opacity:0; transform: translateY(14px); transition: opacity .5s ease, transform .5s ease; }` `.rv.on { opacity:1; transform:none; }` + `.rv-d1/.rv-d2/.rv-d3` stagger delays; reduced-motion → `.rv { opacity:1; transform:none; transition:none }`.
- **1.15 Stateful button states**: `.btn.is-loading` (spinner: `.spin` circle via border-top-color transparent + rotate keyframe, label hidden via `color: transparent` — width preserved), `.btn.is-success` (✓ via `.ok-tick` span, short green flash using forest), disabled guard.
- **1.16 Scroll-hide topbar (Aceternity FloatingNavbar)**: `.topbar { transition: transform .3s ease }` `.topbar.hide { transform: translateY(-100%) }` — only inside `@media (max-width: 640px)`; reduced-motion → no transition.
- **1.17 Micro-lift cards**: `.sig-card:hover, .rep-item:hover { transform: translateY(-1px) }` (existing shadow lift already there for sig-card) — additive transform only.
- **1.18 Live-badge consistency**: no change (already crafted).

Verification: existing pages' CSS untouched above the append point; `node --test` unaffected (no JS); manual: no token values changed (grep diff).

## Task 2 — Shared JS (`assets/app.js`)

Append helpers before the `LiveData` section (or after header-controls section), all vanilla, no deps:

- **2.1 Toast upgrade** — replace `toast(msg)` body with `toast(msg, type)`:
  - `type` in `{ok, err}` else default; sets `className = 'show toast-' + type`; keeps single `#toast` element (no queue — dedupe by content: if same msg currently shown, restart timer + replay entrance via `.toast-fresh` instead of re-setting text).
  - Keep existing signature `toast(msg)` working (default type).
  - New keys needed: none (types are styling).
- **2.2 `initReveals()`** — `IntersectionObserver` one-shot; `.rv` → `.rv.on` at `threshold 0.08`, unobserve after; guard: if `matchMedia('(prefers-reduced-motion: reduce)')` → add `.on` to all immediately; also guard `IntersectionObserver` absence → immediate.
- **2.3 `countUp(el, target, dec)`** — IO-triggered (once) then rAF easeOutCubic ~700ms; uses `Intl.NumberFormat('th-TH', {minimumFractionDigits: dec, maximumFractionDigits: dec})`; sets `el.dataset.v = target`; reduced-motion or IO-missing → set final immediately. For live refresh (10s polls) re-run WITHOUT IO (element already visible) — expose `countUpNow(el, target, dec)`.
- **2.4 `initSeg(container)`** — finds `.seg-btn.active` first (or first child), creates/moves `.seg-pill` with `transform: translateX(offsetLeft) + width`; recalc on resize; click handler toggles `.active` + `aria-pressed` + moves pill; returns nothing. Used for grade row.
- **2.5 `statefulBtn(btn, fn)`** — click → if `.is-loading` return; add `.is-loading`; `await fn()`; add `.is-success`, remove `.is-loading`; `setTimeout` 1400ms → remove `.is-success`; errors: remove `.is-loading`, rethrow to caller for toast.
- **2.6 Topbar scroll-hide** — passive scroll listener: only when `window.innerWidth <= 640`; `lastY > 120 && delta > 8` → `.hide`; scroll-up or `document.activeElement` inside topbar → remove `.hide`; reduced-motion skip; cleanup not needed (single page life).
- **2.7 `initTicker(el)`** — duplicate children once; IO pause (add `.ticker-paused` when offscreen); reduced-motion → static (no animation class).
- **2.8 `sparkSvg(values, w, h)`** — returns inline SVG polyline path scaled to min/max; used by watch chips. (Data-honest: from `priceSeriesFor()`.)
- **2.9 i18n keys (BOTH T.th and T.en)** — new keys:
  - `watchStripTitle` ("ติดตามล่าสุด" / "Following") — home strip
  - `tickerAria` (label for ticker strip) + `tickerLbl` ("ราคาโดยประมาณ" / "Estimated prices")
  - `watchEmptyGo` ("ไปตรวจราคา" / "Check prices") — empty-state CTA
  - `repQuick` ("ใช้ราคาประมาณ {p}" / "Use estimate ~{p}") — report quick-fill
  - `repShowAll` ("ดูทั้งหมด {n} รายการ" / "Show all {n}") — report list
  - `chartFollowAdd` / `chartFollowAdded` / `chartFollowRemove` ("ติดตาม" / "ติดตามแล้ว ✓" / "เลิกติดตาม") — chart toolbar watch toggle
  - `toastSaved` handled by existing repSaved.
- **2.10 LiveData integration** — no changes needed; count-ups get final value from render fns.

Verification: `node tests/*.js` untouched; syntax check `node --check assets/app.js`; existing 6 pages' inline scripts still parse.

## Task 3 — Home (`rutun-price.html` + styles refs)

- **3.1 Hero** — add `.rv` classes + stagger to hero-eyebrow/title/sub/stats/cta; eyebrow gets `.shine-gold` (gold shimmer on dark hero — gold-soft text); CTA gets `.ring-cta` (gold rotating ring) + keeps `.hero-cta` base; press state via Task 1.1.
- **3.2 Verdict card** — `.rv` on card; price count-up: in `renderVerdict()`, after setting `.rb-price b`, call `countUpNow` on that element (only when value changed or first show — track `lastV` var); `.rec-card` keeps existing glow; add `.shine` accent to `rec-eyebrow` (static gradient, no anim — tasteful).
- **3.3 Watch strip** — new section under `.howto` (or after line-banner): hidden when watchlist empty; renders chips (prov · crop ~price) + trend arrow reusing `mini-trend`; tap → `persistCfg` + navigate `rutun-price.html#verdict-sec` (or `price-chart.html`? keep verdict anchor); uses `sparkSvg` optional (keep chips compact: text only + mini-trend).
- **3.4 Ticker strip** — under hero: current province's top-3 main crops with ~price each, duplicated marquee; sr-only static summary; `.ticker-fade` edges; label chip "ราคาโดยประมาณ".
- **3.5 Search/input polish** — Task 1.6 applies via CSS (no HTML change). GPS button: add `.spin` inside when busy (existing text swap stays).
- **3.6 Nav/topbar** — Task 1.16 + 2.6 apply automatically (CSS + app.js). Nothing in HTML.

## Task 4 — Chart page (`price-chart.html`)

- **4.1 Stat strip count-up** — in `renderStats()`: keep innerHTML build, then `countUpNow` each `b` (values known; dec from crop). Guard: only animate on change (store prev signature).
- **4.2 Grade segmented pill** — wrap `.grade-row` as `.seg`: pill moves between A–D; keyboard: keep existing buttons (aria-pressed); click handler existing — augment with `initSeg` call on DOMContentLoaded (guard: only when `!hidden` — grade row hidden for non-graded crops; initSeg must handle hidden container by deferring until visible or init on first show).
- **4.3 Toolbar watch toggle** — new `.btn btn-ghost` next to share buttons: label per watch state (`chartFollowAdd`/`chartFollowRemove`), icon bookmark; on click: toggle `WATCH_KEY` (reuse pattern from main page), toast, stateful ✓ via `statefulBtn`; sync state with existing watchlist.
- **4.4 Section reveals** — `.rv` on price/signals/season panels (one-shot).
- **4.5 Select polish** — CSS only (1.6); no HTML change.

## Task 5 — Watchlist (`watch.html`)

- **5.1 Sparklines** — each watch chip gets `sparkSvg(ser.a)` (26-week) next to price; keep `mini-trend`.
- **5.2 Empty-state anatomy** — replace `.watch-empty` text block with `.empty-box` (icon + title + desc + CTA button → `rutun-price.html`), hidden when list non-empty (keep existing `hidden` logic).
- **5.3 Hit areas** — 1.13 applies; remove button `aria-label` stays.

## Task 6 — Report (`report.html`)

- **6.1 Inline error** — `submitReport`: on invalid price add `.field.invalid` to price field + `aria-invalid="true"` on input + error text element (new key? reuse `repBad`); clear on input; keep toast.
- **6.2 Stateful submit** — `statefulBtn(rep-submit, fn)`; on success toast + reset form.
- **6.3 Quick-fill chips** — under price field: one chip "ใช้ราคาประมาณ ~X" (X = current estimate from `signals().series.a` last, `fmtVal`); tap → fill `rep-price`; labeled "โดยประมาณ" (uses existing live/mock engine — data-honest).
- **6.4 Show-all** — if `reps.length > 12`: render 12 + a "ดูทั้งหมด N รายการ" toggle button (`.btn btn-ghost` small) expanding full list (still capped at 60 storage).
- **6.5 Empty-state anatomy** — `.rep-empty` → `.empty-box` with icon.

## Task 7 — LINE page + About fixes

- **7.1 line.html brand-mark unification** — replace the sun-motif SVG (lines 59–64) with the exact brand-mark SVG used on the other 5 pages (circle+stem+leaves, stroke `#E8B54A` — from rutun-price.html lines 79–85). Theme-consistency fix (evidence: line.html differs from all other pages).
- **7.2 line.html** — `.rv` on panels; chat polish: none beyond existing; keep status badge.
- **7.3 about.html** — no HTML change needed; fix EN `aboutTitle` in app.js: `'About Roo Tun Raka'` → `'About Harvest Trend'` (brand consistency per PRODUCT.md §Brand Commitments; "Roo Tun Raka" is a broken romanization).

## Task 8 — PWA (`sw.js`)

- Add `'line.html'` to `CORE` (currently missing — offline gap for the LINE page on first visit).
- Bump `CACHE` `'rtp-v9'` → `'rtp-v10'` (release convention comment).
- Verification: SW syntax `node --check sw.js`.

## Task 9 — Regression guards (`tests/ui-contract.test.js`, NEW)

Node script, zero deps, same style as existing tests (`ok()` + summary line). Checks:
1. **Theme-token invariance** — read `assets/styles.css`, extract `:root{...}` token block (regex), compare each of the 12 core tokens (`--ground --paper --ink --forest --leaf --gold --gold-soft --clay --clay-soft --sky --sky-soft --moss --line --leaf-tint`) against golden values captured from commit 93b4ff5. Fail on any drift.
2. **Nav parity** — all 6 pages contain the same 6 nav links (hrefs) in order.
3. **SW core coverage** — `sw.js` CORE includes all 6 `.html` pages.
4. **i18n parity** — every `data-i18n` key referenced in the 6 pages exists in both `T.th` and `T.en` (parse app.js T dict via regex of `k:` patterns within th/en blocks).
5. **Brand-mark parity** — all 6 pages contain the same brand-mark SVG (the circle+stem+leaves block); line.html no longer differs.
Exit code 0 = all pass; prints `ui-contract.test.js: N checks OK`.

Also update `tests/` docs? No — keep tests self-describing.

## Task 10 — Integration + review

- Run full suite: `node tests/prices.test.js && node tests/line-bot.test.js && node tests/ui-contract.test.js`; `node --check` on app.js/sw.js; `git diff --check`.
- Final review pass (code-quality subagent), then commit(s) on `feat/ui-hardening-impl` (atomic per task if clean, or grouped logical commits).

## Out of scope (deliberately)

- No changes to engine logic (`signals`/`recommend`/`priceAt`), API files (`api/*`), data honesty labeling semantics.
- No new dependencies, no build step, no framework.
- No new pages; no routing changes.
- No dark mode, no hover-only features as primary UX, no WebGL/canvas effects.
- Existing tests must keep passing unchanged (prices 21, line-bot 30).
