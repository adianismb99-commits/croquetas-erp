import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function LotesIndex() {
  const [lotes, setLotes] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    insumo_id: '',
    proveedor_id: '',
    cantidad: '',
    costo_unitario: '',
    fecha_compra: new Date().toISOString().split('T')[0]
  });

  const fetchLotes = () => {
    setLoading(true);
    axios.get('/api/lotes')
      .then(response => {
        setLotes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
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
    fetchLotes();
    fetchInsumos();
    fetchProveedores();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editando ? `/api/lotes/${editando.id}` : '/api/lotes';
    const method = editando ? 'put' : 'post';

    axios[method](url, formData)
      .then(() => {
        fetchLotes();
        setShowModal(false);
        setEditando(null);
        setFormData({
          insumo_id: '',
          proveedor_id: '',
          cantidad: '',
          costo_unitario: '',
          fecha_compra: new Date().toISOString().split('T')[0]
        });
      })
      .catch(error => console.error('Error:', error));
  };

  const handleEdit = (lote) => {
    setEditando(lote);
    setFormData({
      insumo_id: lote.insumo_id,
      proveedor_id: lote.proveedor_id,
      cantidad: lote.cantidad,
      costo_unitario: lote.costo_unitario || 0,
      fecha_compra: lote.fecha_compra.split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este lote?')) {
      axios.delete(`/api/lotes/${id}`)
        .then(() => fetchLotes())
        .catch(error => console.error('Error:', error));
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Almacén</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Gestiona los insumos en stock</p>
          </div>
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                insumo_id: '',
                proveedor_id: '',
                cantidad: '',
                costo_unitario: '',
                fecha_compra: new Date().toISOString().split('T')[0]
              });
              setShowModal(true);
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nuevo lote
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Insumo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Proveedor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Cantidad</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Costo unitario</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Precio total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Stock restante</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Fecha</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#2D1B3D]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lotes.map((lote) => (
                  <tr key={lote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[#6B3FA0]">
                      {lote.codigo || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#2D1B3D]">
                      {lote.insumo?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lote.proveedor?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lote.cantidad}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">${lote.costo_unitario?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">${lote.precio_total}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#6B3FA0]">
                      {lote.stock_restante}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lote.fecha_compra).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(lote)}
                        className="text-[#6B3FA0] hover:text-[#9B6FC0] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(lote.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {lotes.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📦</span>
                        <p>No hay lotes registrados</p>
                        <p className="text-sm text-gray-400">Registra tu primer lote de compra</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#2D1B3D] mb-4">
                {editando ? 'Editar lote' : 'Nuevo lote'}
              </h2>
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
                      placeholder="Ej: 5"
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
                      placeholder="Ej: 10.00"
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
                    onClick={() => {
                      setShowModal(false);
                      setEditando(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors min-h-[44px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2 rounded-lg transition-colors min-h-[44px]"
                  >
                    {editando ? 'Actualizar' : 'Crear'}
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