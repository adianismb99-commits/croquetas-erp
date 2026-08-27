import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function ProduccionIndex() {
  const [producciones, setProducciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [lotesDisponibles, setLotesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInsumosModal, setShowInsumosModal] = useState(false);
  const [produccionSeleccionada, setProduccionSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    producto_final_id: '',
    cantidad: '',
    fecha_hora: new Date().toISOString().slice(0, 16),
    lotes: []
  });

  const fetchProducciones = () => {
    setLoading(true);
    axios.get('/api/producciones')
      .then(response => {
        setProducciones(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const fetchProductos = () => {
    axios.get('/api/productos')
      .then(response => setProductos(response.data))
      .catch(error => console.error('Error:', error));
  };

  const fetchLotesDisponibles = () => {
    axios.get('/api/lotes-disponibles')
      .then(response => {
        setLotesDisponibles(response.data);
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchProducciones();
    fetchProductos();
    fetchLotesDisponibles();
  }, []);

  const handleProductoChange = (productoId) => {
    setFormData({ ...formData, producto_final_id: productoId, lotes: [] });
    
    if (productoId) {
      axios.get(`/api/recetas/producto/${productoId}`)
        .then(response => {
          const receta = response.data;
          const lotesIniciales = receta.map(item => ({
            insumo_id: item.insumo_id,
            insumo_nombre: item.insumo.nombre,
            cantidad_teorica: item.cantidad_teorica,
            unidades_base: item.unidades_base,
            lote_insumo_id: '',
            cantidad_usada: ''
          }));
          setFormData(prev => ({ ...prev, lotes: lotesIniciales }));
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const handleLoteChange = (index, field, value) => {
    const nuevosLotes = [...formData.lotes];
    nuevosLotes[index][field] = value;
    setFormData({ ...formData, lotes: nuevosLotes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const lotesValidos = formData.lotes.every(
      lote => lote.lote_insumo_id && lote.cantidad_usada
    );

    if (!lotesValidos) {
      alert('Todos los insumos deben tener un lote y cantidad asignada');
      return;
    }

    const dataToSend = {
      producto_final_id: formData.producto_final_id,
      cantidad: formData.cantidad,
      fecha_hora: formData.fecha_hora,
      lotes: formData.lotes.map(lote => ({
        lote_insumo_id: lote.lote_insumo_id,
        cantidad_usada: lote.cantidad_usada
      }))
    };

    axios.post('/api/producciones', dataToSend)
      .then(() => {
        fetchProducciones();
        setShowModal(false);
        setFormData({
          producto_final_id: '',
          cantidad: '',
          fecha_hora: new Date().toISOString().slice(0, 16),
          lotes: []
        });
      })
      .catch(error => console.error('Error:', error));
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar esta producción?')) {
      axios.delete(`/api/producciones/${id}`)
        .then(() => fetchProducciones())
        .catch(error => console.error('Error:', error));
    }
  };

  const verInsumos = (produccion) => {
    setProduccionSeleccionada(produccion);
    setShowInsumosModal(true);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Producción</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Registra tus producciones de croquetas</p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setFormData({
                producto_final_id: '',
                cantidad: '',
                fecha_hora: new Date().toISOString().slice(0, 16),
                lotes: []
              });
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nueva producción
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Producto</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Unidades</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Fecha</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Costo Teórico</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Costo Real</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Diferencia</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">% Variación</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Insumos</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#2D1B3D]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {producciones.map((produccion) => (
                  <tr key={produccion.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono font-medium text-[#6B3FA0]">
                      {produccion.codigo}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-[#2D1B3D]">
                      {produccion.producto_final?.nombre || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">{produccion.cantidad}</td>
                    <td className="px-4 py-4 text-sm text-center text-gray-500">
                      {new Date(produccion.fecha_hora).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-blue-600">
                      ${(produccion.costo_teorico || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-[#6B3FA0]">
                      ${(produccion.costo_real || 0).toFixed(2)}
                    </td>
                    <td className={`px-4 py-4 text-sm text-center font-medium ${produccion.diferencia > 0 ? 'text-red-600' : produccion.diferencia < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      ${(produccion.diferencia || 0).toFixed(2)}
                    </td>
                    <td className={`px-4 py-4 text-sm text-center font-medium ${produccion.porcentaje_variacion > 0 ? 'text-red-600' : produccion.porcentaje_variacion < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {(produccion.porcentaje_variacion || 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => verInsumos(produccion)}
                        className="text-[#6B3FA0] hover:text-[#9B6FC0] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        👁️ Ver
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleDelete(produccion.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {producciones.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🏭</span>
                        <p>No hay producciones registradas</p>
                        <p className="text-sm text-gray-400">Registra tu primera producción</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Nueva Producción */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[#2D1B3D] mb-4">Nueva producción</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.producto_final_id}
                      onChange={(e) => handleProductoChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map(producto => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre} ({producto.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad producida <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Ej: 150"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha y hora <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_hora}
                      onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    />
                  </div>

                  {formData.lotes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insumos utilizados <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        {formData.lotes.map((lote, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-[#2D1B3D] mb-2">
                              {lote.insumo_nombre || 'Insumo'} 
                              <span className="text-xs text-gray-400 ml-2">
                                (Teórico: {lote.cantidad_teorica} para {lote.unidades_base} unidades)
                              </span>
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Lote</label>
                                <select
                                  value={lote.lote_insumo_id}
                                  onChange={(e) => handleLoteChange(index, 'lote_insumo_id', e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                  required
                                >
                                  <option value="">Seleccionar...</option>
                                  {lotesDisponibles
                                    .filter(l => l.insumo_id === lote.insumo_id)
                                    .map(l => (
                                      <option key={l.id} value={l.id}>
                                        {l.codigo} - Stock: {l.stock_restante} {l.insumo?.unidad}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Cantidad usada</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={lote.cantidad_usada}
                                  onChange={(e) => handleLoteChange(index, 'cantidad_usada', e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                  placeholder="Cantidad"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        producto_final_id: '',
                        cantidad: '',
                        fecha_hora: new Date().toISOString().slice(0, 16),
                        lotes: []
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors min-h-[44px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2 rounded-lg transition-colors min-h-[44px]"
                  >
                    Guardar producción
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Ver Insumos */}
        {showInsumosModal && produccionSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#2D1B3D]">
                  Insumos utilizados - {produccionSeleccionada.codigo}
                </h2>
                <button
                  onClick={() => setShowInsumosModal(false)}
                  className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px]"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-[#F5EEF9]">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-[#2D1B3D]">Insumo</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-[#2D1B3D]">Unidad</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-[#2D1B3D]">Cantidad usada</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-[#2D1B3D]">Costo unitario</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-[#2D1B3D]">Costo total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {produccionSeleccionada.produccion_lotes?.map((pl, index) => {
                      const insumo = pl.lote_insumo?.insumo;
                      const real = pl.cantidad_usada || 0;
                      const costoUnitario = pl.costo_unitario || 0;
                      const costoTotal = pl.costo_total || 0;
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#2D1B3D]">
                            {insumo?.nombre || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {insumo?.unidad || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-[#6B3FA0] font-medium">
                            {real.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            ${costoUnitario.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            ${costoTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    {(!produccionSeleccionada.produccion_lotes || produccionSeleccionada.produccion_lotes.length === 0) && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          No hay insumos registrados para esta producción
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-[#F5EEF9]">
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right text-sm font-semibold text-[#2D1B3D]">
                        Costo real total:
                      </td>
                      <td className="px-4 py-2 text-center text-sm font-bold text-[#6B3FA0]">
                        ${(produccionSeleccionada.costo_real || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}