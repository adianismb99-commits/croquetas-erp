<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\Produccion;
use App\Models\ProductoFinal;
use App\Models\Encargo;
use App\Models\Movimiento;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function dashboard()
    {
        $hoy = now()->toDateString();
        
        $ventas_hoy = Venta::whereDate('fecha_hora', $hoy)->get();
        $producciones_hoy = Produccion::whereDate('fecha_hora', $hoy)->get();
        
        $stock = ProductoFinal::all()->map(function($producto) {
            return [
                'producto' => $producto->nombre,
                'stock' => $producto->stock ?? 0
            ];
        });

        $encargos_proximos = Encargo::with(['cliente', 'productoFinal'])
            ->where('estado', 'pendiente')
            ->where('fecha_entrega', '<=', now()->addHours(24))
            ->get();

        return response()->json([
            'ventas_hoy' => [
                'total' => $ventas_hoy->sum('total'),
                'unidades' => $ventas_hoy->sum('cantidad'),
                'ventas' => $ventas_hoy->count()
            ],
            'produccion_hoy' => [
                'unidades' => $producciones_hoy->sum('cantidad'),
                'producciones' => $producciones_hoy->count()
            ],
            'stock' => $stock,
            'encargos_proximos' => $encargos_proximos
        ]);
    }

    public function contabilidad(Request $request)
    {
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

        // Ventas por tipo de cliente
        $ventasPorCliente = Venta::with('cliente')
            ->when($request->filled('fecha_desde'), function($q) use ($request) {
                return $q->whereDate('fecha_hora', '>=', $request->fecha_desde);
            })
            ->when($request->filled('fecha_hasta'), function($q) use ($request) {
                return $q->whereDate('fecha_hora', '<=', $request->fecha_hasta);
            })
            ->get()
            ->groupBy(function($venta) {
                return $venta->cliente->tipo ?? 'particular';
            })
            ->map(function($items) {
                return [
                    'total' => $items->sum('total'),
                    'unidades' => $items->sum('cantidad'),
                    'ventas' => $items->count()
                ];
            });

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
            // Resumen general
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
            // Gráficos
            'graficos' => [
                'ventas_por_dia' => $ventasPorDia,
                'costo_vs_real' => $produccionesData,
                'rentabilidad_productos' => $rentabilidadPorProducto,
                'distribucion_costos' => $costosPorInsumo,
                'ventas_por_cliente' => $ventasPorCliente
            ],
            // Resumen por producto
            'resumen_productos' => $resumenPorProducto,
            // Movimientos recientes
            'movimientos' => $movimientos->sortByDesc('fecha')->take(20)->values()
        ]);
    }

    public function ventas(Request $request)
    {
        $query = Venta::with(['cliente', 'productoFinal']);

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_hora', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_hora', '<=', $request->fecha_hasta);
        }
        if ($request->filled('producto')) {
            $query->whereHas('productoFinal', function($q) use ($request) {
                $q->where('nombre', 'like', '%' . $request->producto . '%');
            });
        }
        if ($request->filled('cliente')) {
            $query->whereHas('cliente', function($q) use ($request) {
                $q->where('nombre', 'like', '%' . $request->cliente . '%');
            });
        }

        $ventas = $query->get();

        return response()->json([
            'total_ingresos' => $ventas->sum('total'),
            'total_unidades' => $ventas->sum('cantidad'),
            'total_ventas' => $ventas->count(),
            'por_producto' => $ventas->groupBy('producto_final_id')->map(function($items) {
                $producto = $items->first()->productoFinal;
                return [
                    'producto' => $producto->nombre ?? 'Sin producto',
                    'unidades' => $items->sum('cantidad'),
                    'ingresos' => $items->sum('total')
                ];
            })->values(),
            'por_cliente' => $ventas->groupBy('cliente_id')->map(function($items) {
                $cliente = $items->first()->cliente;
                return [
                    'cliente' => $cliente->nombre ?? 'Sin cliente',
                    'tipo' => $cliente->tipo ?? 'Desconocido',
                    'unidades' => $items->sum('cantidad'),
                    'ingresos' => $items->sum('total')
                ];
            })->values()->sortByDesc('ingresos')->take(10),
            'por_tipo_cliente' => $ventas->groupBy('cliente.tipo')->map(function($items, $key) {
                return [
                    'tipo' => $key ?: 'Desconocido',
                    'unidades' => $items->sum('cantidad'),
                    'ingresos' => $items->sum('total')
                ];
            })->values(),
            'ventas' => $ventas->take(50)
        ]);
    }

    public function ganancias(Request $request)
    {
        $query = Movimiento::query();

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        $movimientos = $query->get();

        $totalIngresos = $movimientos->where('tipo', 'venta')->sum('costo_total');
        $totalCostos = $movimientos->where('tipo', 'compra')->sum('costo_total') 
            + $movimientos->where('tipo', 'produccion')->sum('costo_total');
        $gananciaBruta = $totalIngresos - $totalCostos;

        $ventas = $movimientos->where('tipo', 'venta');
        $producciones = $movimientos->where('tipo', 'produccion');

        return response()->json([
            'periodo' => [
                'inicio' => $request->fecha_desde,
                'fin' => $request->fecha_hasta
            ],
            'total_ingresos' => $totalIngresos,
            'total_costos' => $totalCostos,
            'ganancia_neta' => $gananciaBruta,
            'unidades_vendidas' => $ventas->sum('cantidad'),
            'unidades_producidas' => $producciones->sum('cantidad'),
            'ganancia_por_unidad' => $ventas->sum('cantidad') > 0 
                ? $gananciaBruta / $ventas->sum('cantidad') 
                : 0,
            'porcentaje_rentabilidad' => $totalIngresos > 0 
                ? ($gananciaBruta / $totalIngresos) * 100 
                : 0
        ]);
    }

    public function topClientes()
    {
        $clientes = Cliente::with(['ventas'])->get();
        
        $top = $clientes->map(function($cliente) {
            return [
                'nombre' => $cliente->nombre,
                'tipo' => $cliente->tipo,
                'total_compras' => $cliente->ventas->sum('cantidad'),
                'total_gastado' => $cliente->ventas->sum('total'),
                'num_compras' => $cliente->ventas->count()
            ];
        })->sortByDesc('total_gastado')->take(5);

        return response()->json($top->values());
    }
}