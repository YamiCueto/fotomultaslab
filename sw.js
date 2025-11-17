// Minimal service worker: cache core assets and serve them; update strategy: cache-first for offline
const CACHE_NAME = 'fotomultaslab-v1';
// Use relative paths so the service worker works correctly when the site is hosted under
// a project subpath (e.g. /fotomultaslab/ on GitHub Pages).
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './assets/logo.svg',
  './assets/icons/camera-speed.svg',
  './assets/icons/camera-light.svg',
  './assets/icons/camera-block.svg',
  './data/camaras.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if(k !== CACHE_NAME) return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});

// Handle update messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // For navigation requests, try network first then cache
  if(req.mode === 'navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('/index.html')));
    return;
  }

    event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // Only cache same-origin, http(s) requests. Some browser extensions use chrome-extension://
      // schemes which will throw when attempting to cache. Guard against that.
      try{
        const url = new URL(req.url);
        if(url.origin === self.location.origin && (url.protocol === 'http:' || url.protocol === 'https:')){
          return caches.open(CACHE_NAME).then(cache => { cache.put(req, res.clone()); return res; });
        }
      }catch(e){
        // ignore invalid URLs or cross-origin requests
      }
      return res;
    }).catch(()=>{}) )
  );
});
