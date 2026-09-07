<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\ProductoFinal;
use App\Models\Cliente;
use App\Models\Movimiento;
use App\Models\Ciclo;
use Illuminate\Http\Request;

class VentaController extends Controller
{
    public function index()
    {
        return response()->json(Venta::with(['cliente', 'productoFinal', 'ciclo'])
            ->orderBy('created_at', 'desc')
            ->get());
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'required|exists:clientes,id',
                'producto_final_id' => 'required|exists:productos_finales,id',
                'cantidad' => 'required|integer|min:1',
                'precio_unitario' => 'required|numeric|min:0',
                'metodo_pago' => 'required|in:efectivo,transferencia',
                'fecha_hora' => 'required|date'
            ]);

            $validated['total'] = $validated['cantidad'] * $validated['precio_unitario'];

            // Obtener o crear ciclo activo
            $cicloActual = Ciclo::getCicloActual();
            if (!$cicloActual) {
                $cicloActual = Ciclo::create([
                    'codigo' => Ciclo::generarCodigo(),
                    'numero' => Ciclo::where('codigo', 'like', now()->format('ymd') . '-%')->count() + 1,
                    'fecha_inicio' => now(),
                    'inversion_total' => 0,
                    'estado' => 'abierto'
                ]);
            }

            $validated['ciclo_id'] = $cicloActual->id;

            // Guardar venta
            $venta = Venta::create($validated);

            // Crear movimiento
            $producto = ProductoFinal::find($validated['producto_final_id']);
            $cliente = Cliente::find($validated['cliente_id']);
            
            $codigo = 'VENTA-' . strtoupper(substr($producto->nombre, 0, 3)) . '-' . now()->format('ymd') . '-' . str_pad($venta->id, 3, '0', STR_PAD_LEFT);
            
            $movimiento = Movimiento::create([
                'codigo' => $codigo,
                'tipo' => 'venta',
                'producto_id' => $validated['producto_final_id'],
                'producto_tipo' => 'producto_final',
                'producto_nombre' => $producto->nombre,
                'unidad' => 'ud',
                'cantidad' => $validated['cantidad'],
                'entrada' => 0,
                'salida' => $validated['cantidad'],
                'saldo' => 0,
                'detalle' => "Venta a: {$cliente->nombre}",
                'costo_total' => $validated['total'],
                'fecha' => $validated['fecha_hora']
            ]);

            $venta->movimiento_id = $movimiento->id;
            $venta->save();

            // 🔥 ACTUALIZAR CICLO - MÉTODO FUERZA BRUTA
            $totalVentas = Venta::where('ciclo_id', $cicloActual->id)->sum('total');
            
            $cicloActual->ingresos_totales = $totalVentas;
            $cicloActual->ganancia_bruta = $totalVentas - $cicloActual->inversion_total;
            $cicloActual->ganancia_neta = $cicloActual->ganancia_bruta - $cicloActual->gastos_operativos;
            
            if ($cicloActual->inversion_total > 0) {
                $cicloActual->porcentaje_rentabilidad = ($cicloActual->ganancia_neta / $cicloActual->inversion_total) * 100;
            } else {
                $cicloActual->porcentaje_rentabilidad = 0;
            }
            
            $cicloActual->save();

            // 🔥 FORZAR REFRESH
            $cicloActual->refresh();
            $venta->load(['cliente', 'productoFinal', 'ciclo']);

            return response()->json([
                'venta' => $venta,
                'ciclo_actual' => $cicloActual,
                'debug' => [
                    'total_ventas' => $totalVentas,
                    'ciclo_id' => $cicloActual->id
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function show($id)
    {
        $venta = Venta::with(['cliente', 'productoFinal', 'ciclo'])->findOrFail($id);
        return response()->json($venta);
    }

    public function update(Request $request, $id)
    {
        $venta = Venta::findOrFail($id);
        
        $validated = $request->validate([
            'cliente_id' => 'sometimes|exists:clientes,id',
            'producto_final_id' => 'sometimes|exists:productos_finales,id',
            'cantidad' => 'sometimes|integer|min:1',
            'precio_unitario' => 'sometimes|numeric|min:0',
            'metodo_pago' => 'sometimes|in:efectivo,transferencia',
            'fecha_hora' => 'sometimes|date'
        ]);

        if (isset($validated['cantidad']) || isset($validated['precio_unitario'])) {
            $cantidad = $validated['cantidad'] ?? $venta->cantidad;
            $precio = $validated['precio_unitario'] ?? $venta->precio_unitario;
            $validated['total'] = $cantidad * $precio;
        }

        $venta->update($validated);

        // Actualizar movimiento
        $producto = ProductoFinal::find($venta->producto_final_id);
        $cliente = Cliente::find($venta->cliente_id);
        
        Movimiento::updateOrCreate(
            ['codigo' => 'VENTA-' . strtoupper(substr($producto->nombre, 0, 3)) . '-' . now()->format('ymd') . '-' . str_pad($venta->id, 3, '0', STR_PAD_LEFT)],
            [
                'tipo' => 'venta',
                'producto_id' => $venta->producto_final_id,
                'producto_tipo' => 'producto_final',
                'producto_nombre' => $producto->nombre,
                'unidad' => 'ud',
                'cantidad' => $venta->cantidad,
                'entrada' => 0,
                'salida' => $venta->cantidad,
                'saldo' => 0,
                'detalle' => "Venta a: {$cliente->nombre}",
                'costo_total' => $venta->total,
                'fecha' => $venta->fecha_hora
            ]
        );

        // Actualizar ciclo
        if ($venta->ciclo_id) {
            $ciclo = Ciclo::find($venta->ciclo_id);
            if ($ciclo) {
                $totalVentas = Venta::where('ciclo_id', $ciclo->id)->sum('total');
                $ciclo->ingresos_totales = $totalVentas;
                $ciclo->ganancia_bruta = $totalVentas - $ciclo->inversion_total;
                $ciclo->ganancia_neta = $ciclo->ganancia_bruta - $ciclo->gastos_operativos;
                if ($ciclo->inversion_total > 0) {
                    $ciclo->porcentaje_rentabilidad = ($ciclo->ganancia_neta / $ciclo->inversion_total) * 100;
                } else {
                    $ciclo->porcentaje_rentabilidad = 0;
                }
                $ciclo->save();
            }
        }

        return response()->json($venta->load(['cliente', 'productoFinal', 'ciclo']));
    }

    public function destroy($id)
    {
        $venta = Venta::findOrFail($id);
        $cicloId = $venta->ciclo_id;
        
        if ($venta->movimiento_id) {
            Movimiento::destroy($venta->movimiento_id);
        }
        
        $venta->delete();

        if ($cicloId) {
            $ciclo = Ciclo::find($cicloId);
            if ($ciclo) {
                $totalVentas = Venta::where('ciclo_id', $ciclo->id)->sum('total');
                $ciclo->ingresos_totales = $totalVentas;
                $ciclo->ganancia_bruta = $totalVentas - $ciclo->inversion_total;
                $ciclo->ganancia_neta = $ciclo->ganancia_bruta - $ciclo->gastos_operativos;
                if ($ciclo->inversion_total > 0) {
                    $ciclo->porcentaje_rentabilidad = ($ciclo->ganancia_neta / $ciclo->inversion_total) * 100;
                } else {
                    $ciclo->porcentaje_rentabilidad = 0;
                }
                $ciclo->save();
            }
        }

        return response()->json(null, 204);
    }

    public function hoy()
    {
        $hoy = now()->toDateString();
        $ventas = Venta::with(['cliente', 'productoFinal', 'ciclo'])
            ->whereDate('fecha_hora', $hoy)
            ->get();
        return response()->json($ventas);
    }

    public function resumen(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        $ventas = Venta::with(['productoFinal', 'cliente', 'ciclo'])
            ->whereBetween('fecha_hora', [
                $request->fecha_inicio,
                $request->fecha_fin . ' 23:59:59'
            ])
            ->get();

        $total_ingresos = $ventas->sum('total');
        $total_unidades = $ventas->sum('cantidad');

        $por_producto = $ventas->groupBy('producto_final_id')->map(function ($items, $key) {
            $producto = $items->first()->productoFinal;
            return [
                'producto' => $producto->nombre,
                'unidades' => $items->sum('cantidad'),
                'ingresos' => $items->sum('total')
            ];
        });

        $por_tipo_cliente = $ventas->groupBy('cliente.tipo')->map(function ($items, $key) {
            return [
                'tipo' => $key,
                'unidades' => $items->sum('cantidad'),
                'ingresos' => $items->sum('total')
            ];
        });

        return response()->json([
            'total_ingresos' => $total_ingresos,
            'total_unidades' => $total_unidades,
            'por_producto' => $por_producto->values(),
            'por_tipo_cliente' => $por_tipo_cliente->values()
        ]);
    }
}
