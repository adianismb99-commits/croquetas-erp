import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import NotificationBell from '@/Components/NotificationBell';
import {
  HomeIcon,
  CubeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  BeakerIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ClockIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    'Almacén': true,  // El submenú de Almacén siempre abierto por defecto
  });
  const [notificacionesExpanded, setNotificacionesExpanded] = useState(false);
  const { url } = usePage();

  useEffect(() => {
    setSidebarOpen(false);
    // No cerramos expandedMenus, para que el submenú se mantenga abierto
  }, [url]);

  const toggleMenu = (name) => {
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const navigation = [
    { name: 'Panel de Control', href: '/dashboard', icon: HomeIcon },
    { name: 'Insumos', href: '/insumos', icon: CubeIcon },
    { name: 'Proveedores', href: '/proveedores', icon: BuildingOfficeIcon },
    {
      name: 'Almacén',
      icon: DocumentTextIcon,
      children: [
        { name: 'Insumos', href: '/lotes' },
        { name: 'Productos Terminados', href: '/almacen/productos-terminados' },
        { name: 'Movimientos', href: '/movimientos' }
      ]
    },
    { name: 'Productos', href: '/productos', icon: ShoppingBagIcon },
    { name: 'Recetas', href: '/recetas', icon: BeakerIcon },
    { name: 'Producción', href: '/produccion', icon: Cog6ToothIcon },
    { name: 'Clientes', href: '/clientes', icon: UserGroupIcon },
    { name: 'Compras', href: '/compras', icon: ShoppingCartIcon },
    { name: 'Ventas', href: '/ventas', icon: ShoppingCartIcon },
    { name: 'Encargos', href: '/encargos', icon: ClockIcon },
    { name: 'Contabilidad', href: '/contabilidad', icon: ChartBarIcon },
  ];

  const isActive = (href) => url === href || url.startsWith(href + '/');
  const isChildActive = (children) => {
    return children?.some(child => isActive(child.href));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#2D1B3D] shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#6B3FA0]">
          <span className="text-white text-lg font-bold">Lumire Croquetas</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#C9A8D6] hover:text-white lg:hidden p-2"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-2 px-2 pb-4 space-y-0.5 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* NOTIFICACIONES AQUÍ - SOLO UNA VEZ */}
          <NotificationBell 
            expanded={notificacionesExpanded} 
            onToggle={() => setNotificacionesExpanded(!notificacionesExpanded)} 
          />

          {navigation.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus[item.name] || false;
            const isActiveParent = hasChildren && isChildActive(item.children);
            const Icon = item.icon;

            if (hasChildren) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActiveParent
                        ? 'bg-[#6B3FA0] text-white'
                        : 'text-[#C9A8D6] hover:bg-[#6B3FA0] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 flex-shrink-0 ml-2" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-[#6B3FA0] pl-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive(child.href)
                              ? 'bg-[#6B3FA0] text-white'
                              : 'text-[#C9A8D6] hover:bg-[#6B3FA0] hover:text-white'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#6B3FA0] text-white'
                    : 'text-[#C9A8D6] hover:bg-[#6B3FA0] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="lg:hidden fixed top-3 left-3 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-[#2D1B3D] text-white shadow-lg"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      <div className="lg:ml-72 min-h-screen">
        <div className="p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
