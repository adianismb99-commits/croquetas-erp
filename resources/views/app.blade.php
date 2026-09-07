<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        <!-- 🔥 FORZAR NO CACHÉ EN NAVEGADOR -->
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        
        <!-- PWA - DESACTIVADO TEMPORALMENTE -->
        <!-- <link rel="manifest" href="/manifest.json" /> -->
        <!-- <link rel="apple-touch-icon" href="/icon-192.png" /> -->
        <!-- <meta name="apple-mobile-web-app-capable" content="yes" /> -->
        <!-- <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" /> -->
        <!-- <meta name="theme-color" content="#6B3FA0" /> -->
        
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- 🔥 DESACTIVAR SERVICE WORKER -->
        <script>
            // Eliminar cualquier Service Worker existente
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                        registration.unregister();
                        console.log('✅ Service Worker desregistrado:', registration.scope);
                    }
                });
                
                // Bloquear nuevos Service Workers
                navigator.serviceWorker.register = function() {
                    console.warn('❌ Service Worker bloqueado');
                    return Promise.reject('Service Workers están desactivados');
                };
            }
            
            // 🔥 FORZAR RECARGA DE ARCHIVOS
            console.log('🔄 Cache desactivado - versión:', Date.now());
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        
        <!-- 🔥 FORZAR LIMPIEZA DE CACHÉ AL CARGAR -->
        <script>
            // Limpiar cachés del navegador
            if ('caches' in window) {
                caches.keys().then(function(names) {
                    for (let name of names) {
                        caches.delete(name).then(function() {
                            console.log('✅ Cache eliminado:', name);
                        });
                    }
                });
            }
            
            // Limpiar localStorage y sessionStorage
            try {
                localStorage.clear();
                sessionStorage.clear();
                console.log('✅ Almacenamiento local limpiado');
            } catch(e) {
                console.log('⚠️ No se pudo limpiar almacenamiento');
            }
        </script>
    </body>
</html>
