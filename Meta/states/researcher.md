# researcher state — MagicUI real-source research (2026-08-15)

Task: fetch real MIT component sources from magicuidesign/magicui for vanilla PWA vendoring (Harvest ecc warm theme).

Status: DONE — all 9 fetches OK, no 404s.

Verified sources (main branch):
- LICENSE.md — MIT, "Copyright (c) Magic UI"
- apps/www/registry/magicui/{animated-shiny-text,marquee,rainbow-button,shimmer-button,ripple-button,pulsating-button,shine-border,number-ticker}.tsx
- apps/www/styles/globals.css — authoritative keyframes (@theme inline): shiny-text, marquee(+vertical), spin-around, rippling, shimmer-slide, shine, pulse, pulse-ripple (oklch from var(--bg) fallback), rainbow
- registry.json — per-component cssVars/keyframes (pulse there is simplified 8px; globals.css uses --distance)

Key port notes:
- Pure CSS: shiny text, marquee, rainbow, shimmer (needs container queries 100cqw/100cqh), shine-border (mask-composite exclude/xor), pulse ring.
- JS port needed: ripple (click coords; use animationend cleanup — upstream only removes last ripple), number-ticker (IntersectionObserver once + spring damping 60 stiffness 100 + Intl.NumberFormat en-US), pulsating --bg capture (MutationObserver; optional if color fixed).
- Rainbow oklch placeholders: color-1 oklch(66.2% .225 25.9), color-2 oklch(60.4% .26 302), color-3 oklch(69.6% .165 251), color-4 oklch(80.2% .134 225), color-5 oklch(90.7% .231 133) → recolor to warm theme.
- motion-safe:animate-shine on shine-border = animation only when prefers-reduced-motion: no-preference. Add reduced-motion gates to marquee/shimmer in port.
- CSS var contract: --duration --gap --speed --spread --shimmer-color --radius --cut --bg --shiny-width --pulse-color --distance --border-width --color-1..5.
- Attribution: MIT, keep copyright notice in vendored file.

Next: hand report to implementer for vanilla CSS/JS porting.
