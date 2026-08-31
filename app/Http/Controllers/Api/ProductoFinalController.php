<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductoFinal;
use Illuminate\Http\Request;

class ProductoFinalController extends Controller
{
    public function index()
    {
        return response()->json(ProductoFinal::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio_particular' => 'required|numeric|min:0',
            'precio_restaurante' => 'required|numeric|min:0',
            'precio_revendedor' => 'required|numeric|min:0'
        ]);

        // Generar código automático (ej: CROQ-001)
        $ultimo = ProductoFinal::orderBy('created_at', 'desc')->first();
        if ($ultimo && preg_match('/CROQ-(\d+)/', $ultimo->codigo, $matches)) {
            $numero = intval($matches[1]) + 1;
        } else {
            $numero = 1;
        }
        $validated['codigo'] = 'CROQ-' . str_pad($numero, 3, '0', STR_PAD_LEFT);

        $producto = ProductoFinal::create($validated);
        return response()->json($producto, 201);
    }

    public function show($id)
    {
        $producto = ProductoFinal::with(['recetas', 'producciones'])->findOrFail($id);
        return response()->json($producto);
    }

    public function update(Request $request, $id)
    {
        $producto = ProductoFinal::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'descripcion' => 'nullable|string',
            'precio_particular' => 'sometimes|numeric|min:0',
            'precio_restaurante' => 'sometimes|numeric|min:0',
            'precio_revendedor' => 'sometimes|numeric|min:0'
        ]);

        $producto->update($validated);
        return response()->json($producto);
    }

    public function destroy($id)
    {
        $producto = ProductoFinal::findOrFail($id);
        $producto->delete();
        return response()->json(null, 204);
    }

    public function stock()
    {
        $productos = ProductoFinal::all();
        $stock = $productos->map(function($producto) {
            return [
                'producto' => $producto->nombre,
                'codigo' => $producto->codigo,
                'stock' => $producto->stock ?? 0,
                'producido' => $producto->producciones()->sum('cantidad'),
                'vendido' => $producto->ventas()->sum('cantidad'),
                'reservado' => $producto->encargos()->where('estado', 'pendiente')->sum('cantidad')
            ];
        });
        return response()->json($stock);
    }
}
