import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import '../css/app.css';

// Configurar zona horaria global para fechas
import { formatDate, formatDateTime, formatDateOnly, formatTime } from '@/Utils/dateFormatter';

// Hacerlas disponibles globalmente (opcional)
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatDateOnly = formatDateOnly;
window.formatTime = formatTime;

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('❌ Error al registrar Service Worker:', error);
            });
    });
}

createInertiaApp({
    resolve: (name) => resolvePageComponent(
        `./pages/${name}.jsx`,
        import.meta.glob('./pages/**/*.jsx')
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
});
