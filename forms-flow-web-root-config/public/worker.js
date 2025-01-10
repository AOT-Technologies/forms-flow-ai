const CACHE_NAME = "FORMS-FLOW-AI-WEB";
const doCache = true;

const urlsToCache = [
  "/manifest.json",
  "/favicon.ico",
];

// Install a service worker
self.addEventListener("install", (event) => {
  if (doCache) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(
          urlsToCache.map((url) => {
            return new Request(url, { mode: "no-cors" });
          })
        );
      })
    );
  }
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseClone = response.clone();

        // Cache the fetched response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // If fetch fails, try to respond with the cached version
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response(null, { status: 404 });
        });
      })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

