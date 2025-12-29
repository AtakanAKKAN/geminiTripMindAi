const CACHE_NAME = 'tripmind-cache-v1';
const DYNAMIC_CACHE = 'tripmind-dynamic-v1';

// Önbelleğe alınacak statik dosyalar
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Kurulum: Statik dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivasyon: Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: İnternet varsa internetten çek, yoksa cache'den ver
self.addEventListener('fetch', (event) => {
  // API isteklerini cacheleme (Her zaman taze veri lazım)
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache'de varsa döndür
      if (cachedResponse) {
        return cachedResponse;
      }

      // Cache'de yoksa network'ten çek
      return fetch(event.request)
        .then((networkResponse) => {
          // Geçerli bir yanıt değilse olduğu gibi döndür
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Yanıtı klonla ve dinamik cache'e at (Resimler, JS dosyaları vb. için)
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // İnternet yoksa ve HTML isteniyorsa offline sayfasını (veya ana sayfayı) döndür
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
    })
  );
});