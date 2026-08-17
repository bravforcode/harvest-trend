/* Harvest Trend · รู้ทันราคา — lightweight, privacy-friendly analytics.
   Fires pageviews + a few key events to POST /api/track via sendBeacon
   (survives navigation, no blocking). No PII is ever sent — just a page path
   and an event name. Fails silently when offline or the API is down. */

function beacon(page: string, event: string): void {
  try {
    const body = JSON.stringify({ page, event });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('api/track', new Blob([body], { type: 'application/json' }));
    } else if (typeof fetch !== 'undefined') {
      void fetch('api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      });
    }
  } catch { /* never let analytics break the app */ }
}

/* pageview on route change — dedupe consecutive identical paths */
let lastPage = '';
export function trackPage(path: string): void {
  if (!path || path === lastPage) return;
  lastPage = path;
  beacon(path, 'pageview');
}

/* one-off key events: e.g. trackEvent('/report', 'submit') */
export function trackEvent(page: string, event: string): void {
  beacon(page, event);
}
