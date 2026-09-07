// Service Worker - Lumire Croquetas ERP
const CACHE_NAME = 'croquetas-v1';
const urlsToCache = [
    '/',
    '/login',
    '/dashboard',
    '/manifest.json',
    '/build/assets/app-BdRg0OmI.css',
    '/build/assets/app-BS1J_4sR.js',
];

// Instalación: guardar archivos en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('❌ Error al cachear:', error);
            })
    );
});

// Activación: limpiar cachés viejas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando caché vieja:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar peticiones: servir desde caché o red
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en caché, devolverlo
                if (response) {
                    return response;
                }
                // Si no está en caché, ir a la red
                return fetch(event.request)
                    .then(response => {
                        // Guardar en caché para la próxima
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        return response;
                    })
                    .catch(() => {
                        // Si no hay internet, mostrar página offline (opcional)
                        return new Response('Sin conexión a internet', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Notificaciones push (para el futuro)
self.addEventListener('push', event => {
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || '/'
            }
        })
    );
});

// Al hacer clic en la notificación
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
