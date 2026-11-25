const CACHE_NAME = 'closet-kraze-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/logo1.png',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching assets skipped some entries:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Product API caching: Network-first with cache fallback
  if (url.pathname.startsWith('/api/products') && event.request.method === 'GET') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request);
          if (fresh && fresh.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, fresh.clone());
          }
          return fresh;
        } catch (error) {
          const cached = await caches.match(event.request);
          if (cached) {
            return cached;
          }
          throw error;
        }
      })()
    );
    return;
  }

  // 2. Bypass mutation requests or non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. Ignore non-product API requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 4. Static assets and SPA navigation
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        if (response && response.status === 200 && event.request.url.startsWith('http')) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
        }
        throw error;
      }
    })()
  );
});
