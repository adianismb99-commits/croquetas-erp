import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function ProductosTerminados() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    producto: '',
    codigo: ''
  });

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtros.producto) params.append('producto', filtros.producto);
    if (filtros.codigo) params.append('codigo', filtros.codigo);

    axios.get(`/api/almacen/productos-terminados?${params.toString()}`)
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
    setFiltros({ producto: '', codigo: '' });
    setTimeout(fetchData, 100);
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Productos Terminados</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Stock de croquetas disponibles</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <form onSubmit={aplicarFiltros} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
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
            <div className="flex items-end gap-2">
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

        {/* Tabla de stock */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Producto</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Producido</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Vendido</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Reservado</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Stock Actual</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Disponible</th>
                </tr>
                </thead>
                <tbody>
                {productos.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono font-medium text-[#6B3FA0]">{item.codigo}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#2D1B3D]">{item.producto}</td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">{item.producido}</td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">{item.vendido}</td>
                    <td className="px-4 py-4 text-sm text-center text-yellow-600">{item.reservado || 0}</td>
                    <td className="px-4 py-4 text-sm text-center font-bold text-[#2D1B3D]">
                        {item.stock_actual}
                    </td>
                    <td className={`px-4 py-4 text-sm text-center font-bold ${item.disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.disponible}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}