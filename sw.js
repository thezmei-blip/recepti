const CACHE = 'moята-кухня-v7';
const ASSETS = [
  './recepti.html',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap',
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first for app shell, network first for API calls
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always use network for Google APIs and auth
  if (url.includes('googleapis.com') || url.includes('accounts.google.com') || url.includes('generativelanguage')) {
    return;
  }

  // Cache first strategy for app assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful GET requests
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return cached app
        if (e.request.mode === 'navigate') {
          return caches.match('./recepti.html');
        }
      });
    })
  );
});
