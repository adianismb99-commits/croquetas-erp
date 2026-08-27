<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductoFinal;
use Illuminate\Http\Request;

class AlmacenController extends Controller
{
    public function productosTerminados(Request $request)
    {
        $query = ProductoFinal::with(['producciones', 'ventas', 'encargos' => function($q) {
            $q->where('estado', 'pendiente');
        }]);

        if ($request->filled('producto')) {
            $query->where('nombre', 'like', '%' . $request->producto . '%');
        }
        if ($request->filled('codigo')) {
            $query->where('codigo', 'like', '%' . $request->codigo . '%');
        }

        $productos = $query->get();

        $resultado = $productos->map(function($producto) {
            $producido = $producto->producciones->sum('cantidad');
            $vendido = $producto->ventas->sum('cantidad');
            $reservado = $producto->encargos->where('estado', 'pendiente')->sum('cantidad');
            
            // STOCK ACTUAL = Producido - Vendido (lo que tienes físicamente)
            $stockActual = $producido - $vendido;
            
            // STOCK DISPONIBLE = Producido - Vendido - Reservado (lo que puedes vender ahora)
            $stockDisponible = $producido - $vendido - $reservado;

            return [
                'producto' => $producto->nombre,
                'codigo' => $producto->codigo,
                'producido' => $producido,
                'vendido' => $vendido,
                'reservado' => $reservado,
                'stock_actual' => $stockActual,
                'disponible' => $stockDisponible > 0 ? $stockDisponible : 0
            ];
        });

        return response()->json($resultado);
    }
}