import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { formatNumber } from '@/Utils/formatters';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

// Colores morados
const moradoPalette = {
    primary: '#6B3FA0',
    secondary: '#9B6FC0',
    light: '#C9A8D6',
    darker: '#2D1B3D',
    gradient: ['#6B3FA0', '#9B6FC0', '#C9A8D6', '#D4B8E0', '#E8D5F0']
};

export default function ContabilidadIndex() {
    const [loading, setLoading] = useState(true);
    const [datos, setDatos] = useState({
        ciclo_actual: null,
        ciclos_cerrados: [],
        resumen: {
            total_inversion: 0,
            total_ingresos: 0,
            total_gastos: 0,
            total_ganancia: 0,
            total_ciclos: 0,
            rentabilidad: 0
        }
    });
    const [graficos, setGraficos] = useState(null);
    const [gastos, setGastos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showModalGasto, setShowModalGasto] = useState(false);
    const [showModalCiclo, setShowModalCiclo] = useState(false);
    const [cicloSeleccionado, setCicloSeleccionado] = useState(null);
    const [showModalAumentar, setShowModalAumentar] = useState(false);
    const [formGasto, setFormGasto] = useState({
        concepto: '',
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria_id: '',
        ciclo_id: '',
        tipo: 'gasto'
    });
    const [formAumentar, setFormAumentar] = useState({
        monto: '',
        descripcion: ''
    });
    const [editandoGasto, setEditandoGasto] = useState(null);
    const [reporte, setReporte] = useState(null);
    const [filtrosReporte, setFiltrosReporte] = useState({
        tipo: 'dia',
        fecha_desde: '',
        fecha_hasta: '',
        ciclo_id: ''
    });
    const [loadingReporte, setLoadingReporte] = useState(false);
    const [filtrosGastos, setFiltrosGastos] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        categoria_id: ''
    });

    // ========== FETCH DATA ==========
    const fetchDashboard = () => {
        axios.get('/api/contabilidad/dashboard')
            .then(response => {
                setDatos(response.data);
            })
            .catch(error => console.error('Error:', error));
    };

    const fetchGraficos = () => {
        axios.get('/api/contabilidad/graficos')
            .then(response => {
                setGraficos(response.data);
            })
            .catch(error => console.error('Error:', error));
    };

    const fetchGastos = () => {
        const params = new URLSearchParams();
        if (filtrosGastos.fecha_desde) params.append('fecha_desde', filtrosGastos.fecha_desde);
        if (filtrosGastos.fecha_hasta) params.append('fecha_hasta', filtrosGastos.fecha_hasta);
        if (filtrosGastos.categoria_id) params.append('categoria_id', filtrosGastos.categoria_id);

        axios.get(`/api/gastos-operativos?${params.toString()}`)
            .then(response => {
                setGastos(response.data);
            })
            .catch(error => console.error('Error:', error));
    };

    const fetchCategorias = () => {
        axios.get('/api/categorias-gastos')
            .then(response => {
                setCategorias(response.data);
            })
            .catch(error => console.error('Error:', error));
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchDashboard(),
            fetchGraficos(),
            fetchGastos(),
            fetchCategorias()
        ]).then(() => setLoading(false));
    }, []);

    // ========== GASTOS ==========
    const handleSubmitGasto = (e) => {
        e.preventDefault();
        const url = editandoGasto ? `/api/gastos-operativos/${editandoGasto.id}` : '/api/gastos-operativos';
        const method = editandoGasto ? 'put' : 'post';

        axios[method](url, formGasto)
            .then(() => {
                fetchGastos();
                fetchDashboard();
                fetchGraficos();
                setShowModalGasto(false);
                setEditandoGasto(null);
                setFormGasto({
                    concepto: '',
                    descripcion: '',
                    monto: '',
                    fecha: new Date().toISOString().split('T')[0],
                    categoria_id: '',
                    ciclo_id: '',
                    tipo: 'gasto'
                });
            })
            .catch(error => console.error('Error:', error));
    };

    const handleDeleteGasto = (id) => {
        if (confirm('¿Estás seguro de eliminar este gasto?')) {
            axios.delete(`/api/gastos-operativos/${id}`)
                .then(() => {
                    fetchGastos();
                    fetchDashboard();
                    fetchGraficos();
                })
                .catch(error => console.error('Error:', error));
        }
    };

    const handleEditGasto = (gasto) => {
        setEditandoGasto(gasto);
        setFormGasto({
            concepto: gasto.concepto,
            descripcion: gasto.descripcion || '',
            monto: gasto.monto,
            fecha: gasto.fecha,
            categoria_id: gasto.categoria_id || '',
            ciclo_id: gasto.ciclo_id || '',
            tipo: gasto.tipo || 'gasto'
        });
        setShowModalGasto(true);
    };

    // ========== CICLOS ==========
    const handleCerrarCiclo = () => {
        if (confirm('¿Estás seguro de cerrar el ciclo actual?')) {
            axios.post('/api/ciclos/cerrar')
                .then(() => {
                    fetchDashboard();
                    fetchGraficos();
                    alert('✅ Ciclo cerrado correctamente');
                })
                .catch(error => console.error('Error:', error));
        }
    };

    const handleAumentarInversion = (e) => {
        e.preventDefault();
        axios.post('/api/ciclos/aumentar-inversion', formAumentar)
            .then(() => {
                fetchDashboard();
                fetchGraficos();
                setShowModalAumentar(false);
                setFormAumentar({ monto: '', descripcion: '' });
                alert('✅ Inversión aumentada correctamente. Nuevo ciclo creado.');
            })
            .catch(error => console.error('Error:', error));
    };

    const handleVerCiclo = (ciclo) => {
        setCicloSeleccionado(ciclo);
        setShowModalCiclo(true);
    };

    // ========== REPORTES ==========
    const fetchReporte = () => {
        setLoadingReporte(true);
        axios.post('/api/contabilidad/reporte', filtrosReporte)
            .then(response => {
                setReporte(response.data);
                setLoadingReporte(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoadingReporte(false);
            });
    };

    useEffect(() => {
        if (filtrosReporte.tipo === 'ciclo' && filtrosReporte.ciclo_id) {
            fetchReporte();
        } else if (filtrosReporte.tipo !== 'ciclo') {
            fetchReporte();
        }
    }, [filtrosReporte]);

    // ========== RENDER ==========
    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-[#6B3FA0] text-xl">Cargando contabilidad...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const { ciclo_actual, ciclos_cerrados, resumen } = datos;

    // Preparar datos para gráficos
    const evolucionData = {
        labels: graficos?.evolucion?.map(g => g.codigo) || [],
        datasets: [{
            label: 'Ganancia Neta ($)',
            data: graficos?.evolucion?.map(g => g.ganancia_neta) || [],
            borderColor: moradoPalette.primary,
            backgroundColor: moradoPalette.primary + '33',
            fill: true,
            tension: 0.4
        }]
    };

    const distribucionData = {
        labels: graficos?.distribucion_gastos?.map(g => g.categoria) || [],
        datasets: [{
            data: graficos?.distribucion_gastos?.map(g => g.total) || [],
            backgroundColor: moradoPalette.gradient,
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const comparativaData = {
        labels: graficos?.comparativa_ciclos?.map(g => g.codigo) || [],
        datasets: [
            {
                label: 'Inversión',
                data: graficos?.comparativa_ciclos?.map(g => g.inversion) || [],
                backgroundColor: moradoPalette.light,
                borderRadius: 4
            },
            {
                label: 'Ingresos',
                data: graficos?.comparativa_ciclos?.map(g => g.ingresos) || [],
                backgroundColor: moradoPalette.primary,
                borderRadius: 4
            },
            {
                label: 'Ganancia',
                data: graficos?.comparativa_ciclos?.map(g => g.ganancia) || [],
                backgroundColor: '#22c55e',
                borderRadius: 4
            }
        ]
    };

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#2D1B3D]">Contabilidad</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Control financiero completo de tu negocio</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => {
                                setEditandoGasto(null);
                                setFormGasto({
                                    concepto: '',
                                    descripcion: '',
                                    monto: '',
                                    fecha: new Date().toISOString().split('T')[0],
                                    categoria_id: '',
                                    ciclo_id: '',
                                    tipo: 'gasto'
                                });
                                setShowModalGasto(true);
                            }}
                            className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                        >
                            + Agregar gasto
                        </button>
                        {ciclo_actual && (
                            <>
                                <button
                                    onClick={() => setShowModalAumentar(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                                >
                                    💰 Aumentar inversión
                                </button>
                                <button
                                    onClick={handleCerrarCiclo}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                                >
                                    🔒 Cerrar ciclo
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#6B3FA0]">
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Inversión</p>
                        <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">${formatNumber(resumen.total_inversion)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-green-500">
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Ingresos</p>
                        <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">${formatNumber(resumen.total_ingresos)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-orange-500">
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Gastos</p>
                        <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">${formatNumber(resumen.total_gastos)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#2D1B3D]">
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Ganancia Neta</p>
                        <p className={`text-sm sm:text-xl font-bold ${resumen.total_ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${formatNumber(resumen.total_ganancia)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-blue-500">
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Rentabilidad</p>
                        <p className={`text-sm sm:text-xl font-bold ${resumen.rentabilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatNumber(resumen.rentabilidad)}%
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#9B6FC0]">
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Ciclos</p>
                        <p className="text-sm sm:text-xl font-bold text-[#2D1B3D]">{resumen.total_ciclos}</p>
                    </div>
                </div>

                {/* Ciclo actual */}
                {ciclo_actual && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-[#2D1B3D]">
                                🔵 Ciclo actual: {ciclo_actual.codigo}
                            </h3>
                            <span className="text-xs text-gray-400">
                                Inicio: {new Date(ciclo_actual.fecha_inicio).toLocaleString()}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4">
                            <div>
                                <p className="text-xs text-gray-500">Inversión</p>
                                <p className="text-sm font-bold text-[#2D1B3D]">${formatNumber(ciclo_actual.inversion_total)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Ingresos</p>
                                <p className="text-sm font-bold text-green-600">${formatNumber(ciclo_actual.ingresos_totales)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Ganancia Bruta</p>
                                <p className={`text-sm font-bold ${ciclo_actual.ganancia_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${formatNumber(ciclo_actual.ganancia_bruta)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Gastos</p>
                                <p className="text-sm font-bold text-orange-600">${formatNumber(ciclo_actual.gastos_operativos)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Ganancia Neta</p>
                                <p className={`text-sm font-bold ${ciclo_actual.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${formatNumber(ciclo_actual.ganancia_neta)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Rentabilidad</p>
                                <p className={`text-sm font-bold ${ciclo_actual.porcentaje_rentabilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatNumber(ciclo_actual.porcentaje_rentabilidad)}%
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500">
                                {ciclo_actual.ganancia_bruta < 0 ? (
                                    <span className="text-red-600">⚠️ Aún no has recuperado tu inversión. Te faltan ${formatNumber(Math.abs(ciclo_actual.ganancia_bruta))}</span>
                                ) : (
                                    <span className="text-green-600">✅ Ya recuperaste tu inversión. Ganancia bruta: ${formatNumber(ciclo_actual.ganancia_bruta)}</span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Historial de ciclos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-[#2D1B3D]">Historial de ciclos</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-[#F5EEF9]">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Código</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Fechas</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Inversión</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Ingresos</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">G. Bruta</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Gastos</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">G. Neta</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">% Rent.</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {ciclos_cerrados.map((ciclo) => (
                                    <tr key={ciclo.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2 text-xs font-mono font-medium text-[#6B3FA0]">{ciclo.codigo}</td>
                                        <td className="px-3 py-2 text-xs text-gray-500">
                                            {new Date(ciclo.fecha_inicio).toLocaleDateString()} - {ciclo.fecha_cierre ? new Date(ciclo.fecha_cierre).toLocaleDateString() : 'Abierto'}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-center">${formatNumber(ciclo.inversion_total)}</td>
                                        <td className="px-3 py-2 text-xs text-center text-green-600">${formatNumber(ciclo.ingresos_totales)}</td>
                                        <td className={`px-3 py-2 text-xs text-center font-medium ${ciclo.ganancia_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${formatNumber(ciclo.ganancia_bruta)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-center text-orange-600">${formatNumber(ciclo.gastos_operativos)}</td>
                                        <td className={`px-3 py-2 text-xs text-center font-bold ${ciclo.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${formatNumber(ciclo.ganancia_neta)}
                                        </td>
                                        <td className={`px-3 py-2 text-xs text-center font-medium ${ciclo.porcentaje_rentabilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatNumber(ciclo.porcentaje_rentabilidad)}%
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                onClick={() => handleVerCiclo(ciclo)}
                                                className="text-[#6B3FA0] hover:text-[#9B6FC0] text-xs font-medium transition-colors min-h-[44px] min-w-[44px]"
                                            >
                                                👁️ Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {ciclos_cerrados.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-gray-500 text-sm">
                                            No hay ciclos cerrados aún
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Gastos operativos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-[#2D1B3D]">Gastos operativos</h3>
                        <button
                            onClick={() => {
                                setEditandoGasto(null);
                                setFormGasto({
                                    concepto: '',
                                    descripcion: '',
                                    monto: '',
                                    fecha: new Date().toISOString().split('T')[0],
                                    categoria_id: '',
                                    ciclo_id: '',
                                    tipo: 'gasto'
                                });
                                setShowModalGasto(true);
                            }}
                            className="text-xs text-[#6B3FA0] hover:underline min-h-[44px] min-w-[44px]"
                        >
                            + Agregar
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-[#F5EEF9]">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Fecha</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Concepto</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Categoría</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Monto</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#2D1B3D]">Ciclo</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#2D1B3D]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {gastos.map((gasto) => (
                                    <tr key={gasto.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2 text-xs text-gray-500">{gasto.fecha}</td>
                                        <td className="px-3 py-2 text-xs font-medium text-[#2D1B3D]">{gasto.concepto}</td>
                                        <td className="px-3 py-2 text-xs">
                                            {gasto.categoria ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: gasto.categoria.color + '33', color: gasto.categoria.color }}>
                                                    {gasto.categoria.nombre}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-[10px]">Sin categoría</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-center font-medium text-orange-600">${formatNumber(gasto.monto)}</td>
                                        <td className="px-3 py-2 text-xs text-gray-500">{gasto.ciclo?.codigo || '-'}</td>
                                        <td className="px-3 py-2 text-center space-x-2">
                                            <button
                                                onClick={() => handleEditGasto(gasto)}
                                                className="text-[#6B3FA0] hover:text-[#9B6FC0] text-xs font-medium transition-colors min-h-[44px] min-w-[44px]"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGasto(gasto.id)}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors min-h-[44px] min-w-[44px]"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {gastos.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm">
                                            No hay gastos registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reportes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-[#2D1B3D]">Reportes</h3>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    value={filtrosReporte.tipo}
                                    onChange={(e) => setFiltrosReporte({ ...filtrosReporte, tipo: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                >
                                    <option value="dia">Día</option>
                                    <option value="semana">Semana</option>
                                    <option value="mes">Mes</option>
                                    <option value="personalizado">Personalizado</option>
                                    <option value="ciclo">Ciclo</option>
                                </select>
                            </div>
                            {filtrosReporte.tipo === 'personalizado' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Fecha desde</label>
                                        <input
                                            type="date"
                                            value={filtrosReporte.fecha_desde}
                                            onChange={(e) => setFiltrosReporte({ ...filtrosReporte, fecha_desde: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Fecha hasta</label>
                                        <input
                                            type="date"
                                            value={filtrosReporte.fecha_hasta}
                                            onChange={(e) => setFiltrosReporte({ ...filtrosReporte, fecha_hasta: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        />
                                    </div>
                                </>
                            )}
                            {filtrosReporte.tipo === 'ciclo' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Ciclo</label>
                                    <select
                                        value={filtrosReporte.ciclo_id}
                                        onChange={(e) => setFiltrosReporte({ ...filtrosReporte, ciclo_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                    >
                                        <option value="">Seleccionar ciclo...</option>
                                        {ciclos_cerrados.map((ciclo) => (
                                            <option key={ciclo.id} value={ciclo.id}>
                                                {ciclo.codigo} - ${formatNumber(ciclo.ganancia_neta)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={fetchReporte}
                                    className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-1.5 rounded-lg text-sm transition-colors min-h-[44px]"
                                >
                                    Generar
                                </button>
                            </div>
                        </div>

                        {loadingReporte ? (
                            <div className="text-center py-4">Cargando reporte...</div>
                        ) : reporte && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Inversión</p>
                                        <p className="text-sm font-bold text-[#2D1B3D]">${formatNumber(reporte.resumen?.inversion)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Ingresos</p>
                                        <p className="text-sm font-bold text-green-600">${formatNumber(reporte.resumen?.ingresos)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Ganancia Neta</p>
                                        <p className={`text-sm font-bold ${reporte.resumen?.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${formatNumber(reporte.resumen?.ganancia_neta)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Rentabilidad</p>
                                        <p className={`text-sm font-bold ${reporte.resumen?.rentabilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatNumber(reporte.resumen?.rentabilidad)}%
                                        </p>
                                    </div>
                                </div>
                                {reporte.ciclo && (
                                    <div className="bg-blue-50 rounded-lg p-3 text-sm">
                                        <p className="font-medium text-[#2D1B3D]">Ciclo: {reporte.ciclo.codigo}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(reporte.ciclo.fecha_inicio).toLocaleDateString()} - {reporte.ciclo.fecha_cierre ? new Date(reporte.ciclo.fecha_cierre).toLocaleDateString() : 'Abierto'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {graficos && (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-sm font-semibold text-[#2D1B3D] mb-4">Evolución de ganancia neta</h3>
                                <div className="h-64">
                                    {evolucionData.labels.length > 0 ? (
                                        <Line data={evolucionData} options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } },
                                            scales: {
                                                y: { beginAtZero: true, ticks: { callback: value => '$' + value, font: { size: 10 } } },
                                                x: { ticks: { font: { size: 9 } } }
                                            }
                                        }} />
                                    ) : (
                                        <div className="flex justify-center items-center h-full text-gray-400 text-sm">Sin datos de ciclos</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-sm font-semibold text-[#2D1B3D] mb-4">Distribución de gastos</h3>
                                <div className="h-64">
                                    {distribucionData.labels.length > 0 ? (
                                        <Pie data={distribucionData} options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'right', labels: { font: { size: 10 } } } }
                                        }} />
                                    ) : (
                                        <div className="flex justify-center items-center h-full text-gray-400 text-sm">No hay gastos registrados</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:col-span-2">
                                <h3 className="text-sm font-semibold text-[#2D1B3D] mb-4">Ventas vs Inversión por ciclo</h3>
                                <div className="h-64">
                                    {comparativaData.labels.length > 0 ? (
                                        <Bar data={comparativaData} options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } },
                                            scales: {
                                                y: { beginAtZero: true, ticks: { callback: value => '$' + value, font: { size: 10 } } },
                                                x: { ticks: { font: { size: 9 } } }
                                            }
                                        }} />
                                    ) : (
                                        <div className="flex justify-center items-center h-full text-gray-400 text-sm">Sin datos de ciclos</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal: Agregar/Editar Gasto */}
            {showModalGasto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#2D1B3D] mb-4">
                            {editandoGasto ? 'Editar gasto' : 'Nuevo gasto'}
                        </h2>
                        <form onSubmit={handleSubmitGasto}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
                                    <input
                                        type="text"
                                        value={formGasto.concepto}
                                        onChange={(e) => setFormGasto({ ...formGasto, concepto: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formGasto.descripcion}
                                        onChange={(e) => setFormGasto({ ...formGasto, descripcion: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        rows="2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formGasto.monto}
                                        onChange={(e) => setFormGasto({ ...formGasto, monto: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                                    <input
                                        type="date"
                                        value={formGasto.fecha}
                                        onChange={(e) => setFormGasto({ ...formGasto, fecha: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        value={formGasto.categoria_id}
                                        onChange={(e) => setFormGasto({ ...formGasto, categoria_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                    >
                                        <option value="">Sin categoría</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo</label>
                                    <select
                                        value={formGasto.ciclo_id}
                                        onChange={(e) => setFormGasto({ ...formGasto, ciclo_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                    >
                                        <option value="">Ciclo actual</option>
                                        {ciclos_cerrados.map((ciclo) => (
                                            <option key={ciclo.id} value={ciclo.id}>
                                                {ciclo.codigo} - ${formatNumber(ciclo.ganancia_neta)}
                                            </option>
                                        ))}
                                        {ciclo_actual && (
                                            <option value={ciclo_actual.id}>{ciclo_actual.codigo} (actual)</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={formGasto.tipo}
                                        onChange={(e) => setFormGasto({ ...formGasto, tipo: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                    >
                                        <option value="gasto">Gasto operativo</option>
                                        <option value="inversion_extra">Inversión extra</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModalGasto(false);
                                        setEditandoGasto(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors min-h-[44px]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white px-4 py-2 rounded-lg transition-colors min-h-[44px]"
                                >
                                    {editandoGasto ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Ver ciclo */}
            {showModalCiclo && cicloSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[#2D1B3D]">Ciclo {cicloSeleccionado.codigo}</h2>
                            <button
                                onClick={() => setShowModalCiclo(false)}
                                className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px]"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">Inversión</p>
                                <p className="text-sm font-bold">${formatNumber(cicloSeleccionado.inversion_total)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">Ingresos</p>
                                <p className="text-sm font-bold text-green-600">${formatNumber(cicloSeleccionado.ingresos_totales)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">G. Neta</p>
                                <p className={`text-sm font-bold ${cicloSeleccionado.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${formatNumber(cicloSeleccionado.ganancia_neta)}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">
                            <p>Inicio: {new Date(cicloSeleccionado.fecha_inicio).toLocaleString()}</p>
                            <p>Cierre: {cicloSeleccionado.fecha_cierre ? new Date(cicloSeleccionado.fecha_cierre).toLocaleString() : 'Abierto'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Aumentar inversión */}
            {showModalAumentar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-[#2D1B3D] mb-4">Aumentar inversión</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Esto creará un nuevo ciclo con la inversión aumentada.
                            Ciclo actual: {ciclo_actual?.codigo}
                        </p>
                        <form onSubmit={handleAumentarInversion}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto extra *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formAumentar.monto}
                                        onChange={(e) => setFormAumentar({ ...formAumentar, monto: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        value={formAumentar.descripcion}
                                        onChange={(e) => setFormAumentar({ ...formAumentar, descripcion: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]"
                                        placeholder="Ej: Compra extra de insumos"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModalAumentar(false);
                                        setFormAumentar({ monto: '', descripcion: '' });
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors min-h-[44px]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors min-h-[44px]"
                                >
                                    Aumentar inversión
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
