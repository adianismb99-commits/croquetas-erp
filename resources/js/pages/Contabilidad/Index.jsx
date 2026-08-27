import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function ContabilidadIndex() {
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState(null);
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    producto: '',
    tipo: ''
  });
  const [exportando, setExportando] = useState(false);

  const tiposMovimiento = [
    { value: '', label: 'Todos' },
    { value: 'compra', label: 'Compra' },
    { value: 'produccion', label: 'Producción' },
    { value: 'uso_insumo', label: 'Uso de insumo' },
    { value: 'venta', label: 'Venta' },
    { value: 'encargo_reserva', label: 'Encargo reserva' },
    { value: 'encargo_entregado', label: 'Encargo entregado' }
  ];

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.producto) params.append('producto', filtros.producto);
    if (filtros.tipo) params.append('tipo', filtros.tipo);

    axios.post(`/api/contabilidad?${params.toString()}`)
      .then(response => {
        setDatos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    fetchData();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_desde: '',
      fecha_hasta: '',
      producto: '',
      tipo: ''
    });
    setTimeout(fetchData, 100);
  };

  const exportarPDF = () => {
    setExportando(true);
    const params = new URLSearchParams();
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.producto) params.append('producto', filtros.producto);
    if (filtros.tipo) params.append('tipo', filtros.tipo);

    axios.post(`/api/contabilidad/exportar?${params.toString()}`)
      .then(response => {
        // Crear un elemento <a> para descargar el JSON (simulación de PDF)
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'contabilidad_' + new Date().toISOString().slice(0,10) + '.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        setExportando(false);
        alert('✅ Reporte exportado correctamente');
      })
      .catch(error => {
        console.error('Error:', error);
        setExportando(false);
        alert('❌ Error al exportar');
      });
  };

  const moradoPalette = {
    primary: '#6B3FA0',
    secondary: '#9B6FC0',
    light: '#C9A8D6',
    darker: '#2D1B3D',
    gradient: ['#6B3FA0', '#9B6FC0', '#C9A8D6', '#D4B8E0', '#E8D5F0']
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-[#6B3FA0] text-xl">Cargando datos contables...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!datos) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-xl">Error al cargar los datos</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const { resumen, graficos, top_clientes, resumen_productos, movimientos } = datos;

  // Convertir datos para gráficos
  const ventasPorDiaArray = Array.isArray(graficos.ventas_por_dia) 
    ? graficos.ventas_por_dia 
    : Object.values(graficos.ventas_por_dia || {});

  const costoVsRealArray = Array.isArray(graficos.costo_vs_real) 
    ? graficos.costo_vs_real 
    : [];

  const rentabilidadProductosArray = Array.isArray(graficos.rentabilidad_productos) 
    ? graficos.rentabilidad_productos 
    : Object.values(graficos.rentabilidad_productos || {});

  const distribucionCostosArray = Array.isArray(graficos.distribucion_costos) 
    ? graficos.distribucion_costos 
    : Object.values(graficos.distribucion_costos || {});

  const ventasPorClienteArray = Array.isArray(graficos.ventas_por_cliente) 
    ? graficos.ventas_por_cliente 
    : Object.values(graficos.ventas_por_cliente || {});
    console.log('VENTAS POR CLIENTE:', ventasPorClienteArray);

  // Gráficos
  const ventasPorDiaData = {
    labels: ventasPorDiaArray.map(v => v.fecha || ''),
    datasets: [{
      label: 'Ingresos ($)',
      data: ventasPorDiaArray.map(v => v.total || 0),
      borderColor: moradoPalette.primary,
      backgroundColor: moradoPalette.primary + '33',
      fill: true,
      tension: 0.4
    }]
  };

  const costoVsRealData = {
    labels: costoVsRealArray.map(v => v.codigo || 'Sin código'),
    datasets: [
      {
        label: 'Costo Teórico',
        data: costoVsRealArray.map(v => v.costo_teorico || 0),
        backgroundColor: moradoPalette.light,
        borderRadius: 4
      },
      {
        label: 'Costo Real',
        data: costoVsRealArray.map(v => v.costo_real || 0),
        backgroundColor: moradoPalette.primary,
        borderRadius: 4
      }
    ]
  };

  const rentabilidadData = {
    labels: rentabilidadProductosArray.map(v => v.nombre || 'Sin nombre'),
    datasets: [{
      label: 'Rentabilidad (%)',
      data: rentabilidadProductosArray.map(v => v.rentabilidad || 0),
      backgroundColor: rentabilidadProductosArray.map(v => 
        v.rentabilidad > 0 ? moradoPalette.primary : moradoPalette.light
      ),
      borderRadius: 4
    }]
  };

  const distribucionCostosData = {
    labels: Object.keys(graficos.distribucion_costos || {}),
    datasets: [{
      data: Object.values(graficos.distribucion_costos || {}),
      backgroundColor: moradoPalette.gradient,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Mapear tipos a nombres legibles
  const tipoLabels = {
    particular: 'Particular',
    restaurante: 'Restaurante',
    revendedor: 'Revendedor'
  };

  // Verificar qué datos tiene ventasPorClienteArray
  console.log('Ventas por cliente:', ventasPorClienteArray);

  // Tipos de cliente fijos en orden
  const tiposFijos = ['particular', 'restaurante', 'revendedor'];
  const nombresFijos = {
    particular: 'Particular',
    restaurante: 'Restaurante',
    revendedor: 'Revendedor'
  };

  // Extraer los datos en el orden fijo
  const datosFijos = tiposFijos.map(tipo => {
    const encontrado = ventasPorClienteArray.find(v => v.tipo === tipo);
    return encontrado ? encontrado.total : 0;
  });

  const ventasPorClienteData = {
    labels: tiposFijos.map(t => nombresFijos[t]),
    datasets: [
      {
        label: 'Ventas ($)',
        data: datosFijos,
        backgroundColor: moradoPalette.gradient.slice(0, 3),
        borderRadius: 4
      }
    ]
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Contabilidad</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Análisis financiero completo de tu negocio</p>
          </div>
          <button
            onClick={exportarPDF}
            disabled={exportando}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span>📄</span> {exportando ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <form onSubmit={aplicarFiltros} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha desde</label>
              <input
                type="date"
                name="fecha_desde"
                value={filtros.fecha_desde}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha hasta</label>
              <input
                type="date"
                name="fecha_hasta"
                value={filtros.fecha_hasta}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
              <input
                type="text"
                name="producto"
                value={filtros.producto}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                placeholder="Buscar producto..."
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={filtros.tipo}
                  onChange={handleFiltroChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                >
                  {tiposMovimiento.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-1.5 rounded-lg text-sm transition-colors min-h-[44px]"
              >
                Filtrar
              </button>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm transition-colors min-h-[44px]"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#6B3FA0]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Ingresos</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">$ {(resumen.total_ingresos || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#9B6FC0]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Costos</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">$ {(resumen.total_costos || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-green-500">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Ganancia Bruta</p>
            <p className="text-sm sm:text-xl font-bold text-green-600">$ {(resumen.ganancia_bruta || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#2D1B3D]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Rentabilidad</p>
            <p className={`text-sm sm:text-xl font-bold ${(resumen.porcentaje_rentabilidad || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(resumen.porcentaje_rentabilidad || 0).toFixed(2)}%
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-blue-500">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Margen x Unidad</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">$ {(resumen.margen_por_unidad || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-orange-500">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Costo Promedio</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">$ {(resumen.costo_promedio_unidad || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Tarjetas adicionales */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Total Ventas</p>
            <p className="text-lg sm:text-2xl font-bold text-[#6B3FA0]">{resumen.total_ventas || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Total Producciones</p>
            <p className="text-lg sm:text-2xl font-bold text-[#9B6FC0]">{resumen.total_producciones || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Total Compras</p>
            <p className="text-lg sm:text-2xl font-bold text-[#C9A8D6]">{resumen.total_compras || 0}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D] mb-3 sm:mb-4">Evolución de Ventas</h3>
            <div className="h-48 sm:h-56 lg:h-64">
              <Line data={ventasPorDiaData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } },
                scales: { 
                  y: { beginAtZero: true, ticks: { callback: function(value) { return '$' + value; }, font: { size: 10 } } },
                  x: { ticks: { font: { size: 9 } } }
                }
              }} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D] mb-3 sm:mb-4">Costo Teórico vs Real</h3>
            <div className="h-48 sm:h-56 lg:h-64">
              <Bar data={costoVsRealData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } },
                scales: { 
                  y: { beginAtZero: true, ticks: { callback: function(value) { return '$' + value; }, font: { size: 10 } } },
                  x: { ticks: { font: { size: 9 } } }
                }
              }} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D] mb-3 sm:mb-4">Rentabilidad por Producto</h3>
            <div className="h-48 sm:h-56 lg:h-64">
              <Bar data={rentabilidadData} options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { 
                  x: { beginAtZero: true, ticks: { callback: function(value) { return value + '%'; }, font: { size: 10 } } },
                  y: { ticks: { font: { size: 9 } } }
                }
              }} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D] mb-3 sm:mb-4">Distribución de Costos</h3>
            <div className="h-48 sm:h-56 lg:h-64">
              <Doughnut data={distribucionCostosData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { font: { size: 9 } } } }
              }} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:col-span-2">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D] mb-3 sm:mb-4">Ventas por Tipo de Cliente</h3>
            <div className="h-48 sm:h-56 lg:h-64">
              <Bar data={ventasPorClienteData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  y: { beginAtZero: true, ticks: { callback: function(value) { return '$' + value; }, font: { size: 10 } } },
                  x: { ticks: { font: { size: 9 } } }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D]">Top 5 Clientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Cliente</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Tipo</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Compras</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Gastado</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Pedidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(top_clientes || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No hay datos de clientes
                    </td>
                  </tr>
                ) : (
                  (top_clientes || []).map((cliente, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-xs sm:text-sm font-medium text-[#2D1B3D]">{cliente.nombre}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">{cliente.tipo}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">{cliente.total_compras}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-green-600">${(cliente.total_gastado || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">{cliente.num_compras}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla: Resumen por Producto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D]">Resumen por Producto</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Producto</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Producido</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Vendido</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">% Venta</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Ingresos</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Costo</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Ganancia</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Rentabilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(resumen_productos || []).length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No hay datos de productos
                    </td>
                  </tr>
                ) : (
                  (resumen_productos || []).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-xs sm:text-sm font-medium text-[#2D1B3D]">{item.nombre}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">{item.producido}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">{item.vendido}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">{(item.porcentaje_venta || 0).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-green-600">$ {(item.ingresos || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-red-600">$ {(item.costo || 0).toFixed(2)}</td>
                      <td className={`px-3 py-2 text-xs sm:text-sm text-center font-medium ${(item.ganancia || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        $ {(item.ganancia || 0).toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 text-xs sm:text-sm text-center font-medium ${(item.rentabilidad || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(item.rentabilidad || 0).toFixed(2)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movimientos recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D1B3D]">Movimientos Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Fecha</th>
                  <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Código</th>
                  <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Tipo</th>
                  <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Producto</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Cantidad</th>
                  <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-[#2D1B3D]">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(movimientos || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No hay movimientos recientes
                    </td>
                  </tr>
                ) : (
                  (movimientos || []).map((mov, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-xs sm:text-sm text-gray-500">
                        {new Date(mov.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-xs sm:text-sm font-mono font-medium text-[#6B3FA0]">
                        {mov.codigo || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs sm:text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getTipoColor(mov.tipo)}`}>
                          {getTipoLabel(mov.tipo)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs sm:text-sm font-medium text-[#2D1B3D]">
                        {mov.producto_nombre}
                      </td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">
                        {mov.cantidad} {mov.unidad}
                      </td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-center text-gray-600">
                        $ {(mov.costo_total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function getTipoLabel(tipo) {
  const tipos = {
    compra: 'Compra',
    produccion: 'Producción',
    uso_insumo: 'Uso de insumo',
    venta: 'Venta',
    encargo_reserva: 'Encargo reserva',
    encargo_entregado: 'Encargo entregado'
  };
  return tipos[tipo] || tipo;
}

function getTipoColor(tipo) {
  const colores = {
    compra: 'bg-blue-100 text-blue-700',
    produccion: 'bg-green-100 text-green-700',
    uso_insumo: 'bg-orange-100 text-orange-700',
    venta: 'bg-purple-100 text-purple-700',
    encargo_reserva: 'bg-yellow-100 text-yellow-700',
    encargo_entregado: 'bg-teal-100 text-teal-700'
  };
  return colores[tipo] || 'bg-gray-100 text-gray-700';
}