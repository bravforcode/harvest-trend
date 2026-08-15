/* Harvest Trend (รู้ทันราคา) — offline cache. Bump CACHE version on release. */
const CACHE = 'rtp-v10';
const CORE = [
  './',
  'rutun-price.html',
  'price-chart.html',
  'report.html',
  'watch.html',
  'line.html',
  'about.html',
  'assets/app.js',
  'assets/styles.css',
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'manifest.webmanifest'
];
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  /* network-first for EVERYTHING: every page load fetches fresh HTML, JS and
     CSS, so a deploy is visible on the next navigation no matter what. The
     cache is only an offline fallback and is never used while online.
     /api responses are never cached at all (live prices must stay fresh). */
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res.ok && e.request.url.indexOf('/api/') === -1){
        const copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      }
      return res;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
