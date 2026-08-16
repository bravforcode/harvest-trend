/* Harvest Trend · รู้ทันราคา — service worker (vite-plugin-pwa injectManifest).
   Precache + navigation fallback (network-first, cache fallback to the
   precached shell), /api/ never cached, and a web-push handler so price
   alerts can display as notifications. */
/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

/* app shell: network-first for navigations, fall back to the precached
   index.html when offline (deploy visible on next navigation, offline works) */
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 4,
    plugins: [
      {
        /* fall back to the precached shell on any fetch failure */
        handlerDidError: async () => (await caches.match('/index.html')) ?? Response.error()
      }
    ]
  })
);

/* /api/ is never cached — always hit the server (fresh prices only) */
registerRoute(({ url }) => url.pathname.startsWith('/api/'), new NetworkOnly());

/* ---------- web push (price alerts) ---------- */
self.addEventListener('push', (event: PushEvent) => {
  let title = 'Harvest Trend';
  let body = '';
  let url = '/';
  try {
    const d = event.data?.json();
    if (d) {
      if (typeof d.title === 'string' && d.title) title = d.title;
      if (typeof d.body === 'string') body = d.body;
      if (typeof d.url === 'string') url = d.url;
    }
  } catch {
    /* non-JSON payload: show the raw text */
    body = event.data?.text() ?? '';
  }
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url }
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(winClients => {
      for (const client of winClients) {
        if ('focus' in client) {
          client.navigate(url).catch(() => {});
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
