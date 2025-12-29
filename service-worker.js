const CACHE_NAME = 'tripmind-cache-v4';
const DYNAMIC_CACHE = 'tripmind-dynamic-v4';

// Önbelleğe alınacak statik dosyalar
// PWABuilder'dan tam puan almak için ikonlar ve manifest kesinlikle burada olmalı.
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/public/favicon.ico',
  '/public/favicon_16.png',
  '/public/favicon_32.png',
  '/public/favicon_64.png',
  '/public/icon-192.png',
  '/public/icon-512.png'
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

// Fetch Stratejisi
self.addEventListener('fetch', (event) => {
  // 1. API İstekleri: Asla cacheleme (Network Only)
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // 2. Navigasyon İstekleri (HTML): Network First, Fallback to Cache
  // İnternet varsa sayfayı yükle, yoksa cache'deki index.html'i (offline sayfası) getir.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match('/index.html');
            });
        })
    );
    return;
  }

  // 3. Statik Dosyalar (JS, CSS, Images): Stale-While-Revalidate
  // Cache'den ver, arka planda yenisini indirip güncelle.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(() => {
          // Fetch hatası (internet yok) durumunda yutulur, cache varsa o döner.
      });

      return cachedResponse || fetchPromise;
    })
  );
});