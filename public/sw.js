// ============================================================
// Countries Marble Race — Service Worker
// Cache-first for game assets, network-first for API.
// ============================================================

const CACHE = 'marble-race-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(ASSETS);
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    })()
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // API requests → network-first
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Game assets → cache-first
  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      const response = await fetch(e.request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(e.request, response.clone());
      }
      return response;
    })()
  );
});
