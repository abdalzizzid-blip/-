const CACHE_NAME = 'koraflix-offline-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Warming up static cache assets deferred:', err);
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

// Cache control helper to clear or audit counts
self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type } = event.data;

  if (type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return caches.open(CACHE_NAME);
      }).then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED', success: true });
          });
        });
      })
    );
  } else if (type === 'GET_CACHE_INFO') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((requests) => {
        const count = requests.length;
        // Count approximate bytes
        let totalSize = 0;
        event.source.postMessage({ type: 'CACHE_INFO', count });
      });
    });
  }
});

// Intercept network queries
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // We want to intercept and cache:
  // 1. TMDB queries & local fallback metadata
  // 2. Unsplash and TMDB image assets (posters / backdrop previews)
  // 3. YouTube Embed files iframes or specific player resources
  // 4. Client bundle static files
  const isTMDB = requestUrl.host.includes('api.themoviedb.org') || requestUrl.host.includes('tmdb.org');
  const isImage = requestUrl.host.includes('unsplash.com') || requestUrl.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)/i);
  const isAPI = requestUrl.pathname.includes('/api/');
  const isLocalStatic = requestUrl.origin === location.origin;
  
  if (event.request.method !== 'GET') {
    return; // Only cache GET items
  }

  // Handle HTML document routing (single-page app support off-grid)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  if (isTMDB || isImage || isAPI || isLocalStatic) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone).catch(err => {
                // Ignore silent quota quota limit errors
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Retrieve from cache if network is broken
          return caches.match(event.request);
        })
    );
  }
});
