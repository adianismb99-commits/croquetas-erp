<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\ProductoFinal;
use App\Models\Cliente;
use App\Models\Movimiento;
use Illuminate\Http\Request;

class VentaController extends Controller
{
    public function index()
    {
        return response()->json(Venta::with(['cliente', 'productoFinal'])
            ->orderBy('created_at', 'desc')
            ->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'producto_final_id' => 'required|exists:productos_finales,id',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'metodo_pago' => 'required|in:efectivo,transferencia',
            'fecha_hora' => 'required|date'
        ]);

        $validated['total'] = $validated['cantidad'] * $validated['precio_unitario'];

        $venta = Venta::create($validated);

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

        return response()->json($venta->load(['cliente', 'productoFinal']), 201);
    }

    public function show($id)
    {
        $venta = Venta::with(['cliente', 'productoFinal'])->findOrFail($id);
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

        return response()->json($venta->load(['cliente', 'productoFinal']));
    }

    public function destroy($id)
    {
        $venta = Venta::findOrFail($id);
        
        if ($venta->movimiento_id) {
            Movimiento::destroy($venta->movimiento_id);
        }
        
        $venta->delete();
        return response()->json(null, 204);
    }

    public function hoy()
    {
        $hoy = now()->toDateString();
        $ventas = Venta::with(['cliente', 'productoFinal'])
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

        $ventas = Venta::with(['productoFinal', 'cliente'])
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
