// 1. Identificador de la versión (Subimos a 1.4 por el cambio de icono)
const CACHE_NAME = 'LeonelB-Rescue-v1.4';

// 2. Archivos Vitales (Asegúrate de que icon-app.png esté en la raíz)
const INITIAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-app.png' 
];

// --- FASE DE INSTALACIÓN ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🦁 [Rescue]: Núcleo del sistema instalado.');
      return cache.addAll(INITIAL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// --- FASE DE ACTIVACIÓN ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('🦁 [Rescue]: Limpiando caché antiguo:', key);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('🦁 [Rescue]: Sistema en línea y listo para el despliegue.');
      return self.clients.claim();
    })
  );
});

// --- ESTRATEGIA DE RED: NETWORK FIRST ---
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
