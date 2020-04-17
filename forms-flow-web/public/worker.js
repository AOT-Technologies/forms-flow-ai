const CACHE_NAME = "FORMS-FLOW-WEB";
// Set this to true for production
const doCache = false;

const urlsToCache = [
  "/",
  "/form",
  "/static/js",
  "/static/js/bundle.js",
  "/manifest.json",
  "/favicon.ico",
  "/icons-192.png",
  "/static/js/main.chunk.js",
  "/static/js/0.chunk.js",
  "/keycloak.json",
  "/static/js/0.chunk.js.map",
  "/spinner.gif",
  "/AOT-logo.png",
  "/AOT-simple-logo.png",
  "https://iam.aot-technologies.com/auth/"
];
// Install a service worker
self.addEventListener("install", event => {
  if(doCache)
  {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      cache.addAll(urlsToCache.map(function(urlsToCache) {
        return new Request(urlsToCache, { mode: 'no-cors' });
      })).then(function() {
        console.log('All resources have been fetched and cached.');
      });
    })
  );
  }
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
// Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
  );
});


// self.addEventListener('fetch', function(event) {
//   console.log(event.request.url);
//   event.respondWith(
//       caches.match(event.request).then(function(response) {
//           return response || fetch(event.request,{ mode: 'no-cors' });
//       })
//   );
// });

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
