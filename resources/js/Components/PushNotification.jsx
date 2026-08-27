import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      // Solicitar permiso
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('❌ Permiso denegado. Activa las notificaciones en la configuración del navegador.');
        setLoading(false);
        return;
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Suscribirse a notificaciones push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'TU_PUBLIC_KEY' // Más abajo explicamos esto
      });

      // Guardar suscripción en el servidor
      await axios.post('/api/notificaciones/subscribe', {
        subscription: subscription
      });

      setIsSubscribed(true);
      alert('✅ Notificaciones activadas');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al activar notificaciones');
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await axios.post('/api/notificaciones/unsubscribe');
        setIsSubscribed(false);
        alert('❌ Notificaciones desactivadas');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#2D1B3D]">🔔 Notificaciones Push</p>
          <p className="text-xs text-gray-500">
            {isSubscribed 
              ? '✅ Notificaciones activadas' 
              : '❌ Notificaciones desactivadas'}
          </p>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
            isSubscribed 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white'
          }`}
        >
          {loading ? 'Procesando...' : (isSubscribed ? 'Desactivar' : 'Activar')}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        {isSubscribed 
          ? 'Recibirás notificaciones de encargos próximos y stock crítico' 
          : 'Activa para recibir notificaciones en tu dispositivo'}
      </p>
    </div>
  );
}