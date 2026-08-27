import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function ClientesIndex() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    tipo: 'particular'
  });

  const fetchClientes = () => {
    setLoading(true);
    axios.get('/api/clientes')
      .then(response => {
        setClientes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editando ? `/api/clientes/${editando.id}` : '/api/clientes';
    const method = editando ? 'put' : 'post';

    axios[method](url, formData)
      .then(() => {
        fetchClientes();
        setShowModal(false);
        setEditando(null);
        setFormData({
          nombre: '',
          telefono: '',
          direccion: '',
          tipo: 'particular'
        });
      })
      .catch(error => console.error('Error:', error));
  };

  const handleEdit = (cliente) => {
    setEditando(cliente);
    setFormData({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion || '',
      tipo: cliente.tipo
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      axios.delete(`/api/clientes/${id}`)
        .then(() => fetchClientes())
        .catch(error => console.error('Error:', error));
    }
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      particular: 'Particular',
      restaurante: 'Restaurante',
      revendedor: 'Revendedor'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoColor = (tipo) => {
    const colores = {
      particular: 'bg-blue-100 text-blue-700',
      restaurante: 'bg-green-100 text-green-700',
      revendedor: 'bg-orange-100 text-orange-700'
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Clientes</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Gestiona tus clientes</p>
          </div>
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                nombre: '',
                telefono: '',
                direccion: '',
                tipo: 'particular'
              });
              setShowModal(true);
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nuevo cliente
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Teléfono</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Dirección</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Tipo</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#2D1B3D]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#2D1B3D]">
                      {cliente.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cliente.direccion || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(cliente.tipo)}`}>
                        {getTipoLabel(cliente.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="text-[#6B3FA0] hover:text-[#9B6FC0] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">👥</span>
                        <p>No hay clientes registrados</p>
                        <p className="text-sm text-gray-400">Crea tu primer cliente</p>
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
                {editando ? 'Editar cliente' : 'Nuevo cliente'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Ej: 555-1234"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Dirección del cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    >
                      <option value="particular">Particular</option>
                      <option value="restaurante">Restaurante</option>
                      <option value="revendedor">Revendedor</option>
                    </select>
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