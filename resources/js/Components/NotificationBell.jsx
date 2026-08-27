import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BellIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

export default function NotificationBell({ expanded, onToggle }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
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

  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('❌ Permiso denegado.');
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BD...'
      });
      await axios.post('/api/notificaciones/subscribe', { subscription });
      setIsSubscribed(true);
      alert('✅ Notificaciones activadas');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al activar');
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await axios.post('/api/notificaciones/unsubscribe', { endpoint: subscription.endpoint });
        setIsSubscribed(false);
        alert('❌ Notificaciones desactivadas');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchNotificaciones = () => {
    axios.get('/api/notificaciones')
      .then(response => {
        setNotificaciones(response.data.notificaciones);
        setTotal(response.data.total);
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 120000);
    return () => clearInterval(interval);
  }, []);

  const getIcono = (tipo) => {
    const iconos = {
      encargo_proximo: '🕐',
      encargo_hoy: '📅',
      stock_critico: '🔴',
      stock_bajo: '🟡'
    };
    return iconos[tipo] || '📌';
  };

  const getColor = (tipo) => {
    const colores = {
      encargo_proximo: 'border-l-4 border-orange-400 bg-orange-50/50',
      encargo_hoy: 'border-l-4 border-blue-400 bg-blue-50/50',
      stock_critico: 'border-l-4 border-red-400 bg-red-50/50',
      stock_bajo: 'border-l-4 border-yellow-400 bg-yellow-50/50'
    };
    return colores[tipo] || 'border-l-4 border-gray-400 bg-gray-50/50';
  };

  return (
    <div className="w-full">
      <div 
        className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-[#6B3FA0] hover:text-white transition-colors text-[#C9A8D6]"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <BellIcon className="w-5 h-5" />
          <span>Notificaciones</span>
          {total > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {total > 9 ? '9+' : total}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDownIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
      </div>

      {expanded && (
        <div className="ml-4 mt-1 space-y-1">
            {isSupported && (
            <button
                onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                className="w-full text-left px-3 py-1.5 text-xs text-[#C9A8D6] hover:text-white transition-colors"
            >
                {isSubscribed ? '🔔 Push activado' : '🔕 Activar push'}
            </button>
            )}

            {notificaciones.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-[#C9A8D6]">
                <p>✅ No hay notificaciones</p>
            </div>
            ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {notificaciones.map((noti, index) => (
                <Link
                    key={index}
                    href={noti.accion || '#'}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${getColor(noti.tipo)} hover:bg-[#6B3FA0]`}
                    onClick={onToggle}
                >
                    <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{getIcono(noti.tipo)}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{noti.titulo}</p>
                        <p className="text-[11px] text-[#E8D5F0] break-words">{noti.mensaje}</p>
                        <p className="text-[10px] text-[#C9A8D6] mt-0.5">{noti.tiempo}</p>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
            )}

            <Link
            href="/encargos"
            className="block px-3 py-1.5 text-xs text-[#C9A8D6] hover:text-white transition-colors"
            onClick={onToggle}
            >
            Ver todos los encargos →
            </Link>
        </div>
      )}
    </div>
  );
}