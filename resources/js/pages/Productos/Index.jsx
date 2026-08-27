import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function ProductosIndex() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_particular: '',
    precio_restaurante: '',
    precio_revendedor: ''
  });

  const fetchProductos = () => {
    setLoading(true);
    axios.get('/api/productos')
      .then(response => {
        setProductos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editando ? `/api/productos/${editando.id}` : '/api/productos';
    const method = editando ? 'put' : 'post';

    axios[method](url, formData)
      .then(() => {
        fetchProductos();
        setShowModal(false);
        setEditando(null);
        setFormData({
          nombre: '',
          descripcion: '',
          precio_particular: '',
          precio_restaurante: '',
          precio_revendedor: ''
        });
      })
      .catch(error => console.error('Error:', error));
  };

  const handleEdit = (producto) => {
    setEditando(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_particular: producto.precio_particular,
      precio_restaurante: producto.precio_restaurante,
      precio_revendedor: producto.precio_revendedor
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      axios.delete(`/api/productos/${id}`)
        .then(() => fetchProductos())
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Productos</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Gestiona tus croquetas y precios</p>
          </div>
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                nombre: '',
                descripcion: '',
                precio_particular: '',
                precio_restaurante: '',
                precio_revendedor: ''
              });
              setShowModal(true);
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nuevo producto
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Particular</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Restaurante</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Revendedor</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#2D1B3D]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[#6B3FA0]">
                      {producto.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#2D1B3D]">
                      {producto.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${parseFloat(producto.precio_particular).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${parseFloat(producto.precio_restaurante).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${parseFloat(producto.precio_revendedor).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="text-[#6B3FA0] hover:text-[#9B6FC0] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {productos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🍢</span>
                        <p>No hay productos registrados</p>
                        <p className="text-sm text-gray-400">Crea tu primer producto (croqueta)</p>
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
                {editando ? 'Editar producto' : 'Nuevo producto'}
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
                      placeholder="Ej: Croqueta de pollo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      rows="2"
                      placeholder="Descripción opcional..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Particular <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precio_particular}
                        onChange={(e) => setFormData({ ...formData, precio_particular: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Restaurante <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precio_restaurante}
                        onChange={(e) => setFormData({ ...formData, precio_restaurante: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Revendedor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precio_revendedor}
                        onChange={(e) => setFormData({ ...formData, precio_revendedor: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>
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