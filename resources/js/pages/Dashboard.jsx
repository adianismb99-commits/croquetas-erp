import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import {
  ShoppingCartIcon,
  ShoppingBagIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState({
    ventas_hoy: { total: 0, unidades: 0, ventas: 0 },
    produccion_hoy: { unidades: 0, producciones: 0 },
    stock_total: 0,
    encargos_pendientes: [],
    stock_critico: [],
    ultimos_movimientos: [],
    alertas: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, notificacionesRes, movimientosRes] = await Promise.all([
        axios.get('/api/reportes/dashboard'),
        axios.get('/api/notificaciones'),
        axios.get('/api/movimientos?limit=10')
      ]);

      const dashboard = dashboardRes.data;
      const notificaciones = notificacionesRes.data;
      const movimientos = movimientosRes.data;

      // ========== ENCARGOS ==========
      let encargosData = [];
      try {
        const encargosRes = await axios.get('/api/encargos');
        const pendientes = encargosRes.data.filter(e => e.estado === 'pendiente');
        console.log('🔔 Encargos pendientes encontrados:', pendientes.length);
        
        encargosData = pendientes.map(e => ({
          id: e.id,
          tipo: 'encargo_pendiente',
          titulo: '📅 Encargo pendiente',
          mensaje: `${e.cliente?.nombre || 'Cliente'} - ${e.cantidad} uds`,
          tiempo: `Entrega: ${new Date(e.fecha_entrega).toLocaleString()}`,
          fecha_entrega: e.fecha_entrega,
          accion: '/encargos'
        }));
      } catch (error) {
        console.error('Error cargando encargos:', error);
      }

      // ========== STOCK CRÍTICO ==========
      // ========== STOCK CRÍTICO (incluye 0 disponibles) ==========
      let stockCriticoData = [];
      let stockTotal = 0;
      try {
          const stockRes = await axios.get('/api/almacen/productos-terminados');
          console.log('📦 Productos terminados:', stockRes.data);
          
          if (Array.isArray(stockRes.data) && stockRes.data.length > 0) {
              // Stock total disponible
              stockTotal = stockRes.data.reduce((acc, item) => acc + (item.disponible || 0), 0);
              
              // Productos con stock bajo (disponible < 50) o stock 0
              // AHORA incluye disponible = 0
              const productosBajos = stockRes.data.filter(p => p.disponible < 50);
              console.log('📦 Productos con stock bajo:', productosBajos);
              
              stockCriticoData = productosBajos.map(p => ({
                  tipo: p.disponible === 0 ? 'stock_critico' : 'stock_bajo',
                  titulo: p.disponible === 0 ? '🔴 Sin stock' : '🟡 Stock bajo',
                  mensaje: `${p.producto}: ${p.disponible} unidades disponibles`,
                  tiempo: p.disponible === 0 ? '⚠️ ¡URGENTE! Producir' : '📦 Reponer pronto',
                  accion: '/almacen/productos-terminados'
              }));
          }
      } catch (error) {
          console.error('Error cargando stock:', error);
      }

      // ========== ALERTAS ==========
      const alertas = notificaciones.notificaciones.slice(0, 3);

      // ========== MOVIMIENTOS ==========
      const ultimosMovimientos = movimientos.slice(0, 8) || [];

      setDatos({
        ventas_hoy: dashboard.ventas_hoy || { total: 0, unidades: 0, ventas: 0 },
        produccion_hoy: dashboard.produccion_hoy || { unidades: 0, producciones: 0 },
        stock_total: stockTotal,
        encargos_pendientes: encargosData,
        stock_critico: stockCriticoData,
        ultimos_movimientos: ultimosMovimientos,
        alertas: alertas
      });
      setLoading(false);
    } catch (error) {
      console.error('Error general:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getColorByType = (tipo) => {
    const colores = {
      compra: 'bg-blue-100 text-blue-700',
      produccion: 'bg-green-100 text-green-700',
      uso_insumo: 'bg-orange-100 text-orange-700',
      venta: 'bg-purple-100 text-purple-700',
      encargo_reserva: 'bg-yellow-100 text-yellow-700',
      encargo_entregado: 'bg-teal-100 text-teal-700'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-700';
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      compra: 'Compra',
      produccion: 'Producción',
      uso_insumo: 'Uso de insumo',
      venta: 'Venta',
      encargo_reserva: 'Encargo reserva',
      encargo_entregado: 'Encargo entregado'
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-[#6B3FA0] text-xl">Cargando panel de control...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Panel de Control</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Resumen rápido de tu negocio</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/ventas"
              className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] flex items-center"
            >
              Nueva venta
            </Link>
            <Link
              href="/produccion"
              className="bg-[#9B6FC0] hover:bg-[#C9A8D6] text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] flex items-center"
            >
              Nueva producción
            </Link>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#6B3FA0]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Ventas hoy</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">${(datos.ventas_hoy.total || 0).toFixed(2)}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">{datos.ventas_hoy.unidades || 0} unidades</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#9B6FC0]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Producción hoy</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">{datos.produccion_hoy.unidades || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">{datos.produccion_hoy.producciones || 0} lotes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-green-500">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Stock disponible</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">{datos.stock_total || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">unidades para vender</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-orange-500">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Encargos pendientes</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">{datos.encargos_pendientes.length || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">por entregar</p>
          </div>
        </div>

        {/* Sección de alertas */}
        {datos.alertas.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-semibold text-[#2D1B3D]">Alertas</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {datos.alertas.map((alerta, index) => (
                <div key={index} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="text-lg">{alerta.tipo === 'encargo_proximo' ? '🕐' : alerta.tipo === 'stock_critico' ? '🔴' : '📌'}</span>
                  <div className="flex-1">
                    <p className="text-sm text-[#2D1B3D]">{alerta.titulo}</p>
                    <p className="text-xs text-gray-500">{alerta.mensaje}</p>
                  </div>
                  <span className="text-xs text-gray-400">{alerta.tiempo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encargos pendientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-[#6B3FA0]" />
              <h3 className="text-sm font-semibold text-[#2D1B3D]">Encargos pendientes</h3>
            </div>
            <Link href="/encargos" className="text-xs text-[#6B3FA0] hover:underline flex items-center gap-1">
              Ver todos <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {datos.encargos_pendientes.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              ✅ No hay encargos pendientes
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {datos.encargos_pendientes.map((encargo, index) => (
                <div key={index} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#2D1B3D]">{encargo.mensaje}</p>
                    <p className="text-xs text-gray-500">{encargo.tiempo}</p>
                  </div>
                  <Link
                    href={encargo.accion || '/encargos'}
                    className="text-sm text-[#6B3FA0] hover:underline"
                  >
                    Ver encargo
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock crítico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-semibold text-[#2D1B3D]">Stock crítico</h3>
            </div>
            <Link href="/lotes" className="text-xs text-[#6B3FA0] hover:underline flex items-center gap-1">
              Ver almacén <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {datos.stock_critico.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              ✅ Todos los productos tienen stock suficiente
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {datos.stock_critico.map((item, index) => (
                <div key={index} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#2D1B3D]">{item.mensaje}</p>
                    <p className="text-xs text-gray-500">{item.tiempo}</p>
                  </div>
                  <Link
                    href={item.accion || '/lotes'}
                    className="text-sm text-[#6B3FA0] hover:underline"
                  >
                    Reponer
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos movimientos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="w-5 h-5 text-[#6B3FA0]" />
              <h3 className="text-sm font-semibold text-[#2D1B3D]">Últimos movimientos</h3>
            </div>
            <Link href="/movimientos" className="text-xs text-[#6B3FA0] hover:underline flex items-center gap-1">
              Ver todos <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {datos.ultimos_movimientos.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No hay movimientos recientes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-[#F5EEF9]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Producto</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Cantidad</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Costo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {datos.ultimos_movimientos.map((mov, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {new Date(mov.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getColorByType(mov.tipo)}`}>
                          {getTipoLabel(mov.tipo)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs font-medium text-[#2D1B3D]">{mov.producto_nombre}</td>
                      <td className="px-4 py-2 text-xs text-center text-gray-600">
                        {mov.cantidad} {mov.unidad}
                      </td>
                      <td className="px-4 py-2 text-xs text-center text-gray-600">
                        ${typeof mov.costo_total === 'number' ? mov.costo_total.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}