import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function VentasIndex() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: '',
    producto_final_id: '',
    cantidad: '',
    precio_unitario: '',
    metodo_pago: 'efectivo',
    fecha_hora: new Date().toISOString().slice(0, 16)
  });

  const fetchVentas = () => {
    setLoading(true);
    axios.get('/api/ventas')
      .then(response => {
        setVentas(response.data);
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
    fetchVentas();
    fetchClientes();
    fetchProductos();
  }, []);

  const handleProductoChange = (productoId) => {
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
      const cliente = clientes.find(c => c.id === formData.cliente_id);
      let precio = 0;
      if (cliente) {
        switch (cliente.tipo) {
          case 'particular':
            precio = producto.precio_particular;
            break;
          case 'restaurante':
            precio = producto.precio_restaurante;
            break;
          case 'revendedor':
            precio = producto.precio_revendedor;
            break;
          default:
            precio = producto.precio_particular;
        }
      }
      setFormData({ ...formData, producto_final_id: productoId, precio_unitario: precio });
    }
  };

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    setFormData({ ...formData, cliente_id: clienteId });
    
    if (cliente && formData.producto_final_id) {
      const producto = productos.find(p => p.id === formData.producto_final_id);
      if (producto) {
        let precio = 0;
        switch (cliente.tipo) {
          case 'particular':
            precio = producto.precio_particular;
            break;
          case 'restaurante':
            precio = producto.precio_restaurante;
            break;
          case 'revendedor':
            precio = producto.precio_revendedor;
            break;
          default:
            precio = producto.precio_particular;
        }
        setFormData(prev => ({ ...prev, precio_unitario: precio }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editando ? `/api/ventas/${editando.id}` : '/api/ventas';
    const method = editando ? 'put' : 'post';

    axios[method](url, formData)
      .then(() => {
        fetchVentas();
        setShowModal(false);
        setEditando(null);
        setFormData({
          cliente_id: '',
          producto_final_id: '',
          cantidad: '',
          precio_unitario: '',
          metodo_pago: 'efectivo',
          fecha_hora: new Date().toISOString().slice(0, 16)
        });
      })
      .catch(error => console.error('Error:', error));
  };

  const handleEdit = (venta) => {
    setEditando(venta);
    setFormData({
      cliente_id: venta.cliente_id,
      producto_final_id: venta.producto_final_id,
      cantidad: venta.cantidad,
      precio_unitario: venta.precio_unitario,
      metodo_pago: venta.metodo_pago,
      fecha_hora: venta.fecha_hora.slice(0, 16)
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      axios.delete(`/api/ventas/${id}`)
        .then(() => fetchVentas())
        .catch(error => console.error('Error:', error));
    }
  };

  const getMetodoPagoLabel = (metodo) => {
    const metodos = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia'
    };
    return metodos[metodo] || metodo;
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Ventas</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Registra tus ventas</p>
          </div>
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                cliente_id: '',
                producto_final_id: '',
                cantidad: '',
                precio_unitario: '',
                metodo_pago: 'efectivo',
                fecha_hora: new Date().toISOString().slice(0, 16)
              });
              setShowModal(true);
            }}
            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <span className="text-xl">+</span> Nueva venta
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[#F5EEF9]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Producto</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Cantidad</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Precio unit.</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D1B3D]">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D1B3D]">Pago</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#2D1B3D]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(venta.fecha_hora).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-[#2D1B3D]">
                      {venta.cliente?.nombre || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {venta.producto_final?.nombre || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">{venta.cantidad}</td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">
                      ${parseFloat(venta.precio_unitario || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-center font-medium text-[#6B3FA0]">
                      ${parseFloat(venta.total || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getMetodoPagoLabel(venta.metodo_pago)}
                    </td>
                    <td className="px-4 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(venta)}
                        className="text-[#6B3FA0] hover:text-[#9B6FC0] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(venta.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {ventas.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">💰</span>
                        <p>No hay ventas registradas</p>
                        <p className="text-sm text-gray-400">Registra tu primera venta</p>
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
                {editando ? 'Editar venta' : 'Nueva venta'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.cliente_id}
                      onChange={(e) => handleClienteChange(e.target.value)}
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
                      Precio unitario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_unitario || ''}
                      onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      placeholder="0.00"
                      required
                    />
                    {formData.cliente_id && formData.producto_final_id && (
                      <p className="text-xs text-gray-400 mt-1">
                        Precio sugerido según tipo de cliente
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de pago <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.metodo_pago}
                      onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] transition-all"
                      required
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
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
