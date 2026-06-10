const CACHE_NAME = 'abc-islam-v1';

// Key assets to pre-cache immediately on load
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/public/images/.gitkeep'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching critical assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event listener to serve cached assets offline and dynamically cache loaded media/images
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip POST, API requests (Pdf/ePub generation) or non-GET requests entirely
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Strategies:
  // 1. Cache-First with Dynamic Caching for Static resources, Images, Stylesheets, JS, and Fonts
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return quickly from cache, still fetch in background to refresh (Stale-While-Revalidate) for dynamic contents
        if (url.origin === self.location.origin && !url.pathname.endsWith('.webp') && !url.pathname.endsWith('.png')) {
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => { /* Ignore background update failures */ });
        }
        return cachedResponse;
      }

      // If not in cache, fetch from internet & cache dynamic copies
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        // Fallback for HTML routing in SPAs when fully offline
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        console.warn('[Service Worker] Fetch failed offline:', request.url, err);
        return new Response('Offline content unavailable', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
