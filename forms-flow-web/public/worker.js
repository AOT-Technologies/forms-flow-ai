const CACHE_NAME = "FORMS-FLOW-AI-WEB";
// Set this to true for production
const doCache = true;

const urlsToCache = [
  "/",
  "/form",
  "/task",
  "/application",
  "/manifest.json",
  "/favicon.ico",
  "/config/kc/keycloak.json",
  "/spinner.gif",
  "/logo.png",
  "/simple-logo.png",
];
// Install a service worker
self.addEventListener("install", event => {
  if(doCache)
  {
  // Perform install steps
  // console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>{
      // console.log("Opened cache");
      cache.addAll(urlsToCache.map((urlsToCache)=> {
        return new Request(urlsToCache, { mode: 'no-cors' });
      })).then(() => console.log('All resources have been fetched and cached.'));
    })
  );
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response)=> {
// Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
  );
});

// Update a service worker
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
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


self.addEventListener('message',  (event)=> {
  //console.log("message",event.data.action);
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
