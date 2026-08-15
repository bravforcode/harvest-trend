# Third-Party UI Licenses

Harvest Trend (รู้ทันราคา) vendors real component code and techniques from open
sources. This file records the required notices. All vendored code was recolored
to the project's Warm orchard ledger theme tokens (no palette changes).

Fetched and verified 2026-08-15.

---

## 1. MagicUI — MIT License

Source: https://github.com/magicuidesign/magicui · https://magicui.design
License file: https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md
Copyright line: **"MIT License — Copyright (c) Magic UI"**

Components/techniques used (real keyframes + algorithms, ported to vanilla
CSS/JS, recolored to the warm orchard theme):

| Technique | Upstream component | Used in |
|---|---|---|
| `@keyframes shiny-text` + `background-clip:text` sweep | AnimatedShinyText | `.shine-gold` (hero eyebrow) |
| `@keyframes marquee` + `-100% - gap` seam | Marquee | `.ticker` (home price strip) |
| 3-layer `background-clip` border ring + `@keyframes rainbow` | RainbowButton | `.rainbow-cta` (hero CTA) |
| Click-ripple algorithm + `@keyframes rippling` | RippleButton | `.ripple` on primary buttons (`.btn-gold/.btn-forest/.btn-warn`) |
| Mask-excluded 1px ring + `@keyframes shine` | ShineBorder | `.rec-card::after` (verdict card ring) |
| IO-triggered count-up + `Intl.NumberFormat` + spring | NumberTicker | `countUp`/`countUpNow` (price + stats) |

MIT notice (verbatim from LICENSE.md):

```
MIT License

Copyright (c) Magic UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. ReactBits — MIT License + Commons Clause v1.0

Source: https://github.com/DavidHDev/react-bits · https://reactbits.dev
License file: https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md
Copyright line: **"MIT + Commons Clause License Condition v1.0 — Copyright (c) 2026 David Haz"**

Techniques used (ported to vanilla, recolored):

| Technique | Upstream component | Used in |
|---|---|---|
| Radial spotlight via `--mouse-x/--mouse-y` CSS vars + `::before` | SpotlightCard | `.card-spotlight` (chart signal cards, fine pointers only) |
| Scroll-reveal (opacity + blur, one-shot) | FadeContent | `.rv` reveal-on-scroll (ported with IntersectionObserver; upstream uses GSAP ScrollTrigger) |

Permission grant (quoted): "Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated documentation files
(the 'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish, distribute
the Software as part of an application, website, or product..."

Commons Clause restriction (quoted): "You may use this Software, including for
any commercial purpose, so long as you do not sell, sublicense, or redistribute
the components themselves — whether alone, in a bundle, or as a ported version."

Compliance: Harvest Trend uses these techniques inside its own end product; it
does not resell, sublicense, or redistribute the components themselves.

---

## 3. Aceternity UI — Aceternity License (proprietary)

Source: https://ui.aceternity.com · License: https://ui.aceternity.com/licence

Used: CSS recipes only (recolored) — the `--shadow-input` 3-layer box-shadow
recipe (signup-form page) applied to `.field input/.search-box/.qc-row select/
.chat-input-row input/.prov-select`; the dot/grid background gradient pattern
applied to the hero texture. No component code is copied (all Aceternity
components are React + Tailwind + Motion; none are vanilla-usable).

Quoted permission clauses: "Create End Products: You can create unlimited end
products for yourself or your clients." · "Distribution: End products may be
sold, licensed, sub-licensed, or freely distributed." · "Modification: You may
modify, manipulate, and combine the Item with other works to create derivative
works."

Quoted prohibition: "You cannot re-distribute the Item as a stock image or its
source files" and "You cannot create themes, templates, or derivative products
to sell on any marketplace."

Compliance: the recipes are used inside Harvest Trend as an end product, not
redistributed as source or sold on a marketplace. Attribution is not required
by the license text but is recorded here as credit.

---

## Not used (why)

- **ReactBits Pro / MagicUI Pro / Aceternity Pro** — paid products; their
  components are not licensed for extraction (ReactBits Pro EULA §2.6 forbids
  replicating preview source).
- **COSS UI (`coss.com/ui`)** — the component package (`packages/ui`) is
  AGPL-3.0-or-later; concepts only (no code copied).
- **React-only components** (Aceternity's full catalog, most ReactBits
  JS-heavy components) — cannot run in a zero-dependency vanilla static site.
