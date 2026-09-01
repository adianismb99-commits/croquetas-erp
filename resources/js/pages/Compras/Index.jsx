import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function ComprasIndex() {
  const [compras, setCompras] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [resumen, setResumen] = useState({
    total_compras: 0,
    total_insumos: 0,
    compras_este_mes: 0,
    proveedor_mas_usado: '',
    por_proveedor: []
  });
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    proveedor: '',
    insumo: ''
  });
  const [formData, setFormData] = useState({
    insumo_id: '',
    proveedor_id: '',
    cantidad: '',
    costo_unitario: '',
    fecha_compra: new Date().toISOString().split('T')[0]
  });

  const fetchCompras = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.proveedor) params.append('proveedor', filtros.proveedor);
    if (filtros.insumo) params.append('insumo', filtros.insumo);

    axios.get(`/api/compras?${params.toString()}`)
      .then(response => {
        setCompras(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const fetchResumen = () => {
    axios.get('/api/compras/resumen')
      .then(response => setResumen(response.data))
      .catch(error => console.error('Error:', error));
  };

  const fetchInsumos = () => {
    axios.get('/api/insumos')
      .then(response => setInsumos(response.data))
      .catch(error => console.error('Error:', error));
  };

  const fetchProveedores = () => {
    axios.get('/api/proveedores')
      .then(response => setProveedores(response.data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchCompras();
    fetchResumen();
    fetchInsumos();
    fetchProveedores();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/compras', formData)
      .then(() => {
        fetchCompras();
        fetchResumen();
        setShowModal(false);
        setFormData({
          insumo_id: '',
          proveedor_id: '',
          cantidad: '',
          costo_unitario: '',
          fecha_compra: new Date().toISOString().split('T')[0]
        });
        alert('✅ Compra registrada correctamente');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('❌ Error al registrar la compra');
      });
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    fetchCompras();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_desde: '',
      fecha_hasta: '',
      proveedor: '',
      insumo: ''
    });
    setTimeout(fetchCompras, 100);
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
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Compras</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Registra tus compras de insumos</p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setFormData({
                insumo_id: '',
                proveedor_id: '',
                cantidad: '',
                costo_unitario: '',
                fecha_compra: new Date().toISOString().split('T')[0]
              });
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nueva compra
          </button>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#6B3FA0]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Total compras</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">$ ${parseFloat(resumen.total_compras || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#9B6FC0]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Total insumos</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">{resumen.total_insumos || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-green-500">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Compras este mes</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">{resumen.compras_este_mes || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#2D1B3D]">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Proveedor más usado</p>
            <p className="text-sm sm:text-lg font-bold text-[#2D1B3D] truncate">{resumen.proveedor_mas_usado || 'Ninguno'}</p>
          </div>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                name="proveedor"
                value={filtros.proveedor}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                placeholder="Buscar proveedor..."
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Insumo</label>
                <input
                  type="text"
                  name="insumo"
                  value={filtros.insumo}
                  onChange={handleFiltroChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                  placeholder="Buscar insumo..."
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

        {/* Tabla de compras */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Insumo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Proveedor</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Cantidad</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Costo unit.</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {compras.map((compra) => (
                  <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(compra.fecha_compra).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm font-mono font-medium text-[#6B3FA0]">
                      {compra.codigo}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-[#2D1B3D]">
                      {compra.insumo?.nombre}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {compra.proveedor?.nombre}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">
                      {compra.cantidad} {compra.insumo?.unidad}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">
                      ${parseFloat(compra.costo_unitario || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-center font-medium text-[#6B3FA0]">
                      ${parseFloat(compra.precio_total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {compras.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🛒</span>
                        <p>No hay compras registradas</p>
                        <p className="text-sm text-gray-400">Registra tu primera compra</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen por proveedor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#2D1B3D]">Resumen por proveedor</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-[#2D1B3D]">Proveedor</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-[#2D1B3D]">Compras</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-[#2D1B3D]">Total gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(resumen.por_proveedor || []).length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No hay datos de proveedores
                    </td>
                  </tr>
                ) : (
                  (resumen.por_proveedor || []).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 text-sm font-medium text-[#2D1B3D]">{item.proveedor}</td>
                      <td className="px-4 py-2 text-sm text-center text-gray-600">{item.total_compras}</td>
                      <td className="px-4 py-2 text-sm text-center font-medium text-[#6B3FA0]">
                        ${(item.total_gastado || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Nueva Compra */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#2D1B3D] mb-4">Nueva compra</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insumo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.insumo_id}
                      onChange={(e) => setFormData({ ...formData, insumo_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    >
                      <option value="">Seleccionar insumo...</option>
                      {insumos.map(insumo => (
                        <option key={insumo.id} value={insumo.id}>
                          {insumo.nombre} ({insumo.unidad})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proveedor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.proveedor_id}
                      onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {proveedores.map(proveedor => (
                        <option key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Ej: 10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo unitario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo_unitario}
                      onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Ej: 390.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de compra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_compra}
                      onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors min-h-[44px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2 rounded-lg transition-colors min-h-[44px]"
                  >
                    Registrar compra
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
