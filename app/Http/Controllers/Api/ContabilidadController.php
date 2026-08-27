<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movimiento;
use App\Models\Venta;
use App\Models\Produccion;
use App\Models\ProductoFinal;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ContabilidadController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Movimiento::query();

            if ($request->filled('fecha_desde')) {
                $query->whereDate('fecha', '>=', $request->fecha_desde);
            }
            if ($request->filled('fecha_hasta')) {
                $query->whereDate('fecha', '<=', $request->fecha_hasta);
            }
            if ($request->filled('producto')) {
                $query->where('producto_nombre', 'like', '%' . $request->producto . '%');
            }
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            $movimientos = $query->get();

            // ========== RESUMEN GENERAL ==========
            $totalIngresos = $movimientos->where('tipo', 'venta')->sum('costo_total');
            $totalCostos = $movimientos->where('tipo', 'compra')->sum('costo_total') 
                + $movimientos->where('tipo', 'produccion')->sum('costo_total');
            $gananciaBruta = $totalIngresos - $totalCostos;
            $porcentajeRentabilidad = $totalIngresos > 0 ? ($gananciaBruta / $totalIngresos) * 100 : 0;

            $ventas = $movimientos->where('tipo', 'venta');
            $producciones = $movimientos->where('tipo', 'produccion');
            $compras = $movimientos->where('tipo', 'compra');

            $unidadesVendidas = $ventas->sum('cantidad');
            $unidadesProducidas = $producciones->sum('cantidad');
            $margenPorUnidad = $unidadesVendidas > 0 ? $gananciaBruta / $unidadesVendidas : 0;
            $costoPromedioUnidad = $unidadesProducidas > 0 ? $totalCostos / $unidadesProducidas : 0;

            // ========== GRÁFICOS ==========
            // 1. Evolución de ventas por día
            $ventasPorDia = $ventas->groupBy(function($item) {
                return $item->fecha->format('Y-m-d');
            })->map(function($items) {
                return [
                    'total' => $items->sum('costo_total'),
                    'unidades' => $items->sum('cantidad'),
                    'ventas' => $items->count()
                ];
            })->sortKeys();

            // 2. Costo teórico vs real por producción
            $produccionesData = Produccion::with(['productoFinal'])
                ->when($request->filled('fecha_desde'), function($q) use ($request) {
                    return $q->whereDate('fecha_hora', '>=', $request->fecha_desde);
                })
                ->when($request->filled('fecha_hasta'), function($q) use ($request) {
                    return $q->whereDate('fecha_hora', '<=', $request->fecha_hasta);
                })
                ->get()
                ->map(function($p) {
                    return [
                        'codigo' => $p->codigo,
                        'producto' => $p->productoFinal->nombre ?? 'Sin producto',
                        'costo_teorico' => $p->costo_teorico ?? 0,
                        'costo_real' => $p->costo_real ?? 0,
                        'diferencia' => ($p->costo_real ?? 0) - ($p->costo_teorico ?? 0)
                    ];
                });

            // 3. Rentabilidad por producto
            $rentabilidadPorProducto = $movimientos->groupBy('producto_nombre')->map(function($items, $nombre) {
                $ventasProducto = $items->where('tipo', 'venta')->sum('costo_total');
                $costosProducto = $items->where('tipo', 'compra')->sum('costo_total') 
                    + $items->where('tipo', 'produccion')->sum('costo_total');
                $ganancia = $ventasProducto - $costosProducto;
                return [
                    'nombre' => $nombre,
                    'ventas' => $ventasProducto,
                    'costos' => $costosProducto,
                    'ganancia' => $ganancia,
                    'rentabilidad' => $ventasProducto > 0 ? ($ganancia / $ventasProducto) * 100 : 0
                ];
            })->sortByDesc('ganancia')->take(10);

            // 4. Distribución de costos por insumo
            $costosPorInsumo = Movimiento::where('tipo', 'uso_insumo')
                ->when($request->filled('fecha_desde'), function($q) use ($request) {
                    return $q->whereDate('fecha', '>=', $request->fecha_desde);
                })
                ->when($request->filled('fecha_hasta'), function($q) use ($request) {
                    return $q->whereDate('fecha', '<=', $request->fecha_hasta);
                })
                ->get()
                ->groupBy('producto_nombre')
                ->map(function($items) {
                    return $items->sum('costo_total');
                })
                ->sortByDesc('ganancia')
                ->take(8);

            // 5. Ventas por tipo de cliente
            $ventasPorCliente = [];
            $ventasQuery = Venta::with('cliente')
                ->when($request->filled('fecha_desde'), function($q) use ($request) {
                    return $q->whereDate('fecha_hora', '>=', $request->fecha_desde);
                })
                ->when($request->filled('fecha_hasta'), function($q) use ($request) {
                    return $q->whereDate('fecha_hora', '<=', $request->fecha_hasta);
                })
                ->get();

            // Si no hay ventas, devolver array vacío
            if ($ventasQuery->isEmpty()) {
                $ventasPorCliente = [];
            } else {
                foreach ($ventasQuery as $venta) {
                    // Asegurar que el cliente existe y tiene tipo
                    if ($venta->cliente) {
                        $tipo = $venta->cliente->tipo ?? 'particular';
                    } else {
                        $tipo = 'particular';
                    }
                    
                    if (!isset($ventasPorCliente[$tipo])) {
                        $ventasPorCliente[$tipo] = [
                            'tipo' => $tipo,
                            'total' => 0, 
                            'unidades' => 0, 
                            'ventas' => 0
                        ];
                    }
                    $ventasPorCliente[$tipo]['total'] += $venta->total;
                    $ventasPorCliente[$tipo]['unidades'] += $venta->cantidad;
                    $ventasPorCliente[$tipo]['ventas'] += 1;
                }
                // Convertir a array indexado
                $ventasPorCliente = array_values($ventasPorCliente);
            }

            // 6. Top clientes
            $topClientes = Cliente::with(['ventas'])
                ->get()
                ->map(function($cliente) {
                    return [
                        'nombre' => $cliente->nombre,
                        'tipo' => $cliente->tipo,
                        'total_compras' => $cliente->ventas->sum('cantidad'),
                        'total_gastado' => $cliente->ventas->sum('total'),
                        'num_compras' => $cliente->ventas->count()
                    ];
                })->sortByDesc('total_gastado')->take(5);

            // ========== RESUMEN POR PRODUCTO ==========
            $resumenPorProducto = ProductoFinal::all()->map(function($producto) use ($request) {
                $ventasProducto = $producto->ventas()
                    ->when($request->filled('fecha_desde'), function($q) use ($request) {
                        return $q->whereDate('fecha_hora', '>=', $request->fecha_desde);
                    })
                    ->when($request->filled('fecha_hasta'), function($q) use ($request) {
                        return $q->whereDate('fecha_hora', '<=', $request->fecha_hasta);
                    })
                    ->get();
                
                $produccionesProducto = $producto->producciones()
                    ->when($request->filled('fecha_desde'), function($q) use ($request) {
                        return $q->whereDate('fecha_hora', '>=', $request->fecha_desde);
                    })
                    ->when($request->filled('fecha_hasta'), function($q) use ($request) {
                        return $q->whereDate('fecha_hora', '<=', $request->fecha_hasta);
                    })
                    ->get();

                $totalVentas = $ventasProducto->sum('total');
                $totalUnidadesVendidas = $ventasProducto->sum('cantidad');
                $totalProducido = $produccionesProducto->sum('cantidad');
                $costoProduccion = $produccionesProducto->sum('costo_real');

                return [
                    'nombre' => $producto->nombre,
                    'codigo' => $producto->codigo,
                    'producido' => $totalProducido,
                    'vendido' => $totalUnidadesVendidas,
                    'porcentaje_venta' => $totalProducido > 0 ? ($totalUnidadesVendidas / $totalProducido) * 100 : 0,
                    'ingresos' => $totalVentas,
                    'costo' => $costoProduccion,
                    'ganancia' => $totalVentas - $costoProduccion,
                    'rentabilidad' => $totalVentas > 0 ? (($totalVentas - $costoProduccion) / $totalVentas) * 100 : 0
                ];
            })->filter(function($item) {
                return $item['producido'] > 0 || $item['vendido'] > 0;
            })->values();

            return response()->json([
                'resumen' => [
                    'total_ingresos' => $totalIngresos,
                    'total_costos' => $totalCostos,
                    'ganancia_bruta' => $gananciaBruta,
                    'porcentaje_rentabilidad' => $porcentajeRentabilidad,
                    'margen_por_unidad' => $margenPorUnidad,
                    'costo_promedio_unidad' => $costoPromedioUnidad,
                    'unidades_vendidas' => $unidadesVendidas,
                    'unidades_producidas' => $unidadesProducidas,
                    'total_ventas' => $ventas->count(),
                    'total_producciones' => $producciones->count(),
                    'total_compras' => $compras->count()
                ],
                'graficos' => [
                    'ventas_por_dia' => $ventasPorDia,
                    'costo_vs_real' => $produccionesData,
                    'rentabilidad_productos' => $rentabilidadPorProducto,
                    'distribucion_costos' => $costosPorInsumo,
                    'ventas_por_cliente' => $ventasPorCliente
                ],
                'top_clientes' => $topClientes->values(),
                'resumen_productos' => $resumenPorProducto,
                'movimientos' => $movimientos->sortByDesc('fecha')->take(50)->values()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function exportar(Request $request)
    {
        $data = $this->index($request)->getData();
        return response()->json($data);
    }
}