<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movimiento;
use Illuminate\Http\Request;

class MovimientoController extends Controller
{
    public function index(Request $request)
    {
        $query = Movimiento::query();

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }
        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        if ($request->filled('producto')) {
            $query->where('producto_nombre', 'like', '%' . $request->producto . '%');
        }
        if ($request->filled('codigo')) {
            $query->where('codigo', 'like', '%' . $request->codigo . '%');
        }

            return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function resumen()
    {
        $movimientos = Movimiento::all();
        
        $totalCompras = $movimientos->where('tipo', 'compra')->sum('costo_total');
        $totalVentas = $movimientos->where('tipo', 'venta')->sum('costo_total');
        $totalProduccion = $movimientos->where('tipo', 'produccion')->sum('costo_total');
        $totalUsoInsumos = $movimientos->where('tipo', 'uso_insumo')->sum('costo_total');
        
        return response()->json([
            'total_compras' => $totalCompras,
            'total_ventas' => $totalVentas,
            'total_produccion' => $totalProduccion,
            'total_uso_insumos' => $totalUsoInsumos,
            'balance' => $totalVentas - ($totalCompras + $totalProduccion)
        ]);
    }

    public function resumenPorProducto()
    {
        $productos = Movimiento::select('producto_nombre', 'producto_tipo')
            ->distinct()
            ->get();

        $resumen = [];
        foreach ($productos as $producto) {
            $movimientos = Movimiento::where('producto_nombre', $producto->producto_nombre)->get();
            $resumen[] = [
                'nombre' => $producto->producto_nombre,
                'tipo' => $producto->producto_tipo,
                'entradas' => $movimientos->sum('entrada'),
                'salidas' => $movimientos->sum('salida'),
                'saldo' => $movimientos->sum('entrada') - $movimientos->sum('salida'),
                'costo_total' => $movimientos->sum('costo_total')
            ];
        }

        return response()->json($resumen);
    }
}
