/* Harvest Trend (รู้ทันราคา) — offline cache. Bump CACHE version on release. */
const CACHE = 'rtp-v7';
const CORE = [
  './',
  'rutun-price.html',
  'price-chart.html',
  'report.html',
  'watch.html',
  'about.html',
  'assets/app.js',
  'assets/styles.css',
  'assets/icon.svg',
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
  // live prices must never be served from cache — always hit the network
  if(e.request.url.indexOf('/api/') !== -1){
    e.respondWith(fetch(e.request));
    return;
  }
  // pages (navigations): network-first so every deploy reaches users on the
  // next page load; the cached copy is only an offline fallback
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(function(res){
        const copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
        return res;
      }).catch(function(){
        return caches.match(e.request);
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        const copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
        return res;
      });
    })
  );
});
