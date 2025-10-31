// Minimal service worker: cache core assets and serve them; update strategy: cache-first for offline
const CACHE_NAME = 'fotomultaslab-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/assets/logo.svg',
  '/assets/icons/camera-speed.svg',
  '/assets/icons/camera-light.svg',
  '/assets/icons/camera-block.svg',
  '/data/camaras.json'
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // For navigation requests, try network first then cache
  if(req.mode === 'navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('/index.html')));
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // cache fetched assets (simple strategy)
      return caches.open(CACHE_NAME).then(cache => { cache.put(req, res.clone()); return res; });
    }).catch(()=>{}) )
  );
});
