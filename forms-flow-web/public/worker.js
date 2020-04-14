var CACHE_NAME = "REACT_KEYCLOAK";
var urlsToCache = [
  "/",
  "/static/js",
  "/static/js/bundle.js",
  "/manifest.json",
  "/favicon.ico",
  "/icons-192.png",
  "/static/js/0.chunk.js",
  "/static/js/main.chunk.js",
  "/keycloak.json",
  "/static/js/0.chunk.js.map",
  "/bcid-logo-rev-en.svg ",
  "/bcid-symbol-rev.svg",
  "/spinner.gif"
];

// Install a service worker
self.addEventListener("install", event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache, {
        mode: "no-cors"
      });
    })
  );
});

// Cache and return requests
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Update a service worker
self.addEventListener("activate", event => {
  var cacheWhitelist = ["REACT_KEYCLOAK"];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
