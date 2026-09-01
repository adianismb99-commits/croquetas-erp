import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function RecetasIndex() {
  const [recetas, setRecetas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    producto_final_id: '',
    insumos: [{ insumo_id: '', cantidad_teorica: '' }],
    unidades_base: '100'
  });

  const fetchRecetas = () => {
    setLoading(true);
    axios.get('/api/recetas')
      .then(response => {
        setRecetas(response.data);
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

  const fetchInsumos = () => {
    axios.get('/api/insumos')
      .then(response => setInsumos(response.data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchRecetas();
    fetchProductos();
    fetchInsumos();
  }, []);

  const handleAddInsumo = () => {
    setFormData({
      ...formData,
      insumos: [...formData.insumos, { insumo_id: '', cantidad_teorica: '' }]
    });
  };

  const handleRemoveInsumo = (index) => {
    const nuevosInsumos = formData.insumos.filter((_, i) => i !== index);
    setFormData({ ...formData, insumos: nuevosInsumos });
  };

  const handleInsumoChange = (index, field, value) => {
    const nuevosInsumos = [...formData.insumos];
    nuevosInsumos[index][field] = value;
    setFormData({ ...formData, insumos: nuevosInsumos });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const insumosValidos = formData.insumos.every(
        insumo => insumo.insumo_id && insumo.cantidad_teorica
    );

    if (!insumosValidos) {
        alert('Todos los insumos deben tener cantidad');
        return;
    }

    const url = editando 
        ? `/api/recetas/${editando.id}`
        : '/api/recetas';
    const method = editando ? 'put' : 'post';

    const dataToSend = {
        producto_final_id: formData.producto_final_id,
        insumos: formData.insumos.map(insumo => ({
            insumo_id: insumo.insumo_id,
            cantidad_teorica: parseFloat(insumo.cantidad_teorica) || 0
        })),
        unidades_base: parseInt(formData.unidades_base) || 100
    };

    axios[method](url, dataToSend)
      .then(() => {
        fetchRecetas();
        setShowModal(false);
        setEditando(null);
        setFormData({
          producto_final_id: '',
          insumos: [{ insumo_id: '', cantidad_teorica: '' }],
          unidades_base: '100'
        });
      })
      .catch(error => {
        console.error('Error:', error.response?.data || error.message);
        alert('❌ Error al guardar la receta');
      });
  };

  const handleEdit = (receta) => {
    if (!receta || !receta.id) {
        console.error('Datos de receta inválidos:', receta);
        alert('Error al cargar la receta para editar');
        return;
    }

    axios.get(`/api/recetas/${receta.id}`)
        .then(response => {
            const data = response.data;
            setEditando(data);
            setFormData({
                producto_final_id: data.producto.id,
                insumos: data.insumos.map(item => ({
                    insumo_id: item.insumo.id,
                    cantidad_teorica: item.cantidad_teorica
                })),
                unidades_base: data.unidades_base || 100
            });
            setShowModal(true);
        })
        .catch(error => {
            console.error('Error cargando receta:', error);
            alert('Error al cargar la receta para editar');
        });
  };

  const handleDelete = (receta) => {
    if (!receta || !receta.id) {
        alert('No se puede eliminar esta receta (ID no encontrado)');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar esta receta?')) {
        axios.delete(`/api/recetas/${receta.id}`)
            .then(() => {
                fetchRecetas();
                alert('✅ Receta eliminada correctamente');
            })
            .catch(error => {
                console.error('Error:', error.response?.data || error.message);
                alert('❌ Error al eliminar la receta');
            });
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Recetas</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Define la fórmula de cada producto</p>
          </div>
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                producto_final_id: '',
                insumos: [{ insumo_id: '', cantidad_teorica: '' }],
                unidades_base: '100'
              });
              setShowModal(true);
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nueva receta
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Producto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Insumos</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Base</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#2D1B3D]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recetas.map((receta, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[#6B3FA0]">
                        {receta.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#2D1B3D]">
                      {receta.producto?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {receta.insumos?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span>{item.insumo?.nombre}</span>
                          <span className="text-gray-400">•</span>
                          <span>{item.cantidad_teorica} {item.insumo?.unidad}</span>
                          {i < receta.insumos.length - 1 && <span className="text-gray-300 mx-1">|</span>}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {receta.insumos?.[0]?.unidades_base || '-'} unidades
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(receta)}
                        className="text-[#6B3FA0] hover:text-[#9B6FC0] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(receta)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {recetas.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📝</span>
                        <p>No hay recetas registradas</p>
                        <p className="text-sm text-gray-400">Define la fórmula de tus productos</p>
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
                {editando ? 'Editar receta' : 'Nueva receta'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
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
                      Insumos <span className="text-red-500">*</span>
                    </label>
                    {formData.insumos.map((insumo, index) => (
                      <div key={index} className="flex gap-2 mb-2 items-end">
                        <div className="flex-1">
                          <select
                            value={insumo.insumo_id}
                            onChange={(e) => handleInsumoChange(index, 'insumo_id', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                            required
                          >
                            <option value="">Insumo...</option>
                            {insumos.map(ins => (
                              <option key={ins.id} value={ins.id}>
                                {ins.nombre} ({ins.unidad})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            step="0.01"
                            value={insumo.cantidad_teorica}
                            onChange={(e) => handleInsumoChange(index, 'cantidad_teorica', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                            placeholder="Cantidad"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInsumo(index)}
                          className="text-red-500 hover:text-red-700 px-2 min-h-[44px] min-w-[44px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddInsumo}
                      className="text-sm text-[#6B3FA0] hover:text-[#9B6FC0] transition-colors min-h-[44px]"
                    >
                      + Añadir insumo
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidades base <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.unidades_base}
                      onChange={(e) => setFormData({ ...formData, unidades_base: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="Ej: 100"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Cantidad de croquetas que produces con esta receta</p>
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
