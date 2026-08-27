import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function MovimientosIndex() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    tipo: '',
    producto: '',
    codigo: ''
  });

  const tiposMovimiento = [
    { value: '', label: 'Todos' },
    { value: 'compra', label: 'Compra' },
    { value: 'produccion', label: 'Producción' },
    { value: 'uso_insumo', label: 'Uso de insumo' },
    { value: 'venta', label: 'Venta' },
    { value: 'encargo_reserva', label: 'Encargo reserva' },
    { value: 'encargo_entregado', label: 'Encargo entregado' }
  ];

  const fetchMovimientos = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.producto) params.append('producto', filtros.producto);
    if (filtros.codigo) params.append('codigo', filtros.codigo);

    axios.get(`/api/movimientos?${params.toString()}`)
      .then(response => {
        setMovimientos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    fetchMovimientos();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_desde: '',
      fecha_hasta: '',
      tipo: '',
      producto: '',
      codigo: ''
    });
    setTimeout(fetchMovimientos, 100);
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

  const getTipoColor = (tipo) => {
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

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-[#6B3FA0] text-xl">Cargando...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Movimientos de Almacén</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Historial completo de todos los movimientos</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <form onSubmit={aplicarFiltros} className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={filtros.codigo}
                  onChange={handleFiltroChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                  placeholder="Buscar por código..."
                />
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

        {/* Tabla de movimientos */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Producto</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Cantidad</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Entrada</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Salida</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Saldo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Detalle</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(mov.fecha).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-[#6B3FA0]">
                      {mov.codigo || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(mov.tipo)}`}>
                        {getTipoLabel(mov.tipo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#2D1B3D]">
                      {mov.producto_nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {mov.cantidad} {mov.unidad}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-green-600">
                      {mov.entrada > 0 ? `+${mov.entrada}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-red-600">
                      {mov.salida > 0 ? `-${mov.salida}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-[#2D1B3D]">
                      {mov.saldo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {mov.detalle || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      ${mov.costo_total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📋</span>
                        <p>No hay movimientos registrados</p>
                        <p className="text-sm text-gray-400">Los movimientos aparecerán automáticamente al registrar compras, producciones y ventas</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}