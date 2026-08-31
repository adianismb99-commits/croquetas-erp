import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function EncargosIndex() {
  const [encargos, setEncargos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: '',
    producto_final_id: '',
    cantidad: '',
    precio_acordado: '',
    fecha_entrega: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    estado: 'pendiente'
  });

  const fetchEncargos = () => {
    setLoading(true);
    axios.get('/api/encargos')
      .then(response => {
        setEncargos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const fetchClientes = () => {
    axios.get('/api/clientes')
      .then(response => setClientes(response.data))
      .catch(error => console.error('Error:', error));
  };

  const fetchProductos = () => {
    axios.get('/api/productos')
      .then(response => setProductos(response.data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchEncargos();
    fetchClientes();
    fetchProductos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editando ? `/api/encargos/${editando.id}` : '/api/encargos';
    const method = editando ? 'put' : 'post';

    axios[method](url, formData)
      .then(() => {
        fetchEncargos();
        setShowModal(false);
        setEditando(null);
        setFormData({
          cliente_id: '',
          producto_final_id: '',
          cantidad: '',
          precio_acordado: '',
          fecha_entrega: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          estado: 'pendiente'
        });
      })
      .catch(error => console.error('Error:', error));
  };

  const handleEdit = (encargo) => {
    setEditando(encargo);
    setFormData({
      cliente_id: encargo.cliente_id,
      producto_final_id: encargo.producto_final_id,
      cantidad: encargo.cantidad,
      precio_acordado: encargo.precio_acordado,
      fecha_entrega: encargo.fecha_entrega.slice(0, 16),
      estado: encargo.estado
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este encargo?')) {
      axios.delete(`/api/encargos/${id}`)
        .then(() => fetchEncargos())
        .catch(error => console.error('Error:', error));
    }
  };

  const handleEntregar = (id) => {
    if (confirm('¿Marcar este encargo como entregado?')) {
      axios.put(`/api/encargos/${id}/entregar`)
        .then(() => {
          fetchEncargos();
          alert('✅ Encargo marcado como entregado. Se ha creado una venta automáticamente.');
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      listo: 'bg-blue-100 text-blue-700',
      entregado: 'bg-green-100 text-green-700'
    };
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      listo: 'Listo',
      entregado: 'Entregado'
    };
    return labels[estado] || estado;
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Encargos</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Gestiona pedidos futuros</p>
          </div>
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                cliente_id: '',
                producto_final_id: '',
                cantidad: '',
                precio_acordado: '',
                fecha_entrega: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                estado: 'pendiente'
              });
              setShowModal(true);
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nuevo encargo
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Producto</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Cantidad</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Precio</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Entrega</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Estado</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#2D1B3D]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {encargos.map((encargo) => (
                  <tr key={encargo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-[#2D1B3D]">
                      {encargo.cliente?.nombre || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {encargo.producto_final?.nombre || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">{parseInt(encargo.cantidad || 0)}</td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">
                      ${parseFloat(encargo.precio_acordado || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-500">
                      {new Date(encargo.fecha_entrega).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(encargo.estado)}`}>
                        {getEstadoLabel(encargo.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right space-x-3">
                      {encargo.estado !== 'entregado' && (
                        <>
                          <button
                            onClick={() => handleEdit(encargo)}
                            className="text-[#6B3FA0] hover:text-[#9B6FC0] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEntregar(encargo.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                          >
                            Entregar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(encargo.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {encargos.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📅</span>
                        <p>No hay encargos registrados</p>
                        <p className="text-sm text-gray-400">Crea tu primer encargo</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#2D1B3D] mb-4">
                {editando ? 'Editar encargo' : 'Nuevo encargo'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.cliente_id}
                      onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} ({cliente.tipo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.producto_final_id}
                      onChange={(e) => setFormData({ ...formData, producto_final_id: e.target.value })}
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
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Cantidad"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio acordado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_acordado || ''}
                      onChange={(e) => setFormData({ ...formData, precio_acordado: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de entrega <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_entrega}
                      onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    />
                  </div>

                  {editando && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="listo">Listo</option>
                        <option value="entregado">Entregado</option>
                      </select>
                    </div>
                  )}
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
