<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receta;
use Illuminate\Http\Request;

class RecetaController extends Controller
{
    public function index()
    {
        $recetas = Receta::with(['productoFinal', 'insumo'])
            ->orderBy('created_at', 'desc')
            ->get();
    
        // Agrupar por código de receta (cada receta tiene su propio código)
        $agrupadas = $recetas->groupBy('codigo')->map(function($items) {
            $primera = $items->first();
            return [
                'codigo' => $primera->codigo,
                'producto' => $primera->productoFinal,
                'insumos' => $items->map(function($item) {
                    return [
                        'id' => $item->id,
                        'insumo' => $item->insumo,
                        'cantidad_teorica' => $item->cantidad_teorica,
                        'unidades_base' => $item->unidades_base
                    ];
                })
            ];
        })->values();
    
        return response()->json($agrupadas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_final_id' => 'required|exists:productos_finales,id',
            'insumos' => 'required|array|min:1',
            'insumos.*.insumo_id' => 'required|exists:insumos,id',
            'insumos.*.cantidad_teorica' => 'required|numeric|min:0.01',
            'unidades_base' => 'required|integer|min:1'
        ]);
    
        $producto = ProductoFinal::find($validated['producto_final_id']);
        $prefijo = strtoupper(substr($producto->nombre, 0, 3));
        
        $recetasCreadas = [];
        foreach ($validated['insumos'] as $insumoData) {
            // Generar código único para cada receta
            $ultimo = Receta::where('codigo', 'like', $prefijo . '-%')
                ->orderBy('codigo', 'desc')
                ->first();
            
            if ($ultimo && preg_match('/' . $prefijo . '-(\d+)/', $ultimo->codigo, $matches)) {
                $numero = intval($matches[1]) + 1;
            } else {
                $numero = 1;
            }
            $codigo = $prefijo . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    
            $receta = Receta::create([
                'codigo' => $codigo,
                'producto_final_id' => $validated['producto_final_id'],
                'insumo_id' => $insumoData['insumo_id'],
                'cantidad_teorica' => $insumoData['cantidad_teorica'],
                'unidades_base' => $validated['unidades_base']
            ]);
            $recetasCreadas[] = $receta->load(['productoFinal', 'insumo']);
        }
    
        return response()->json($recetasCreadas, 201);
    }
    public function show($id)
    {
        // Mostrar todas las recetas de un producto
        $recetas = Receta::with(['productoFinal', 'insumo'])
            ->where('producto_final_id', $id)
            ->get();
        
        if ($recetas->isEmpty()) {
            return response()->json(['message' => 'No hay recetas para este producto'], 404);
        }

        return response()->json([
            'producto' => $recetas->first()->productoFinal,
            'insumos' => $recetas->map(function($item) {
                return [
                    'id' => $item->id,
                    'insumo' => $item->insumo,
                    'cantidad_teorica' => $item->cantidad_teorica,
                    'unidades_base' => $item->unidades_base
                ];
            })
        ]);
    }

    public function update(Request $request, $id)
    {
        $receta = Receta::findOrFail($id);
        
        $validated = $request->validate([
            'insumo_id' => 'sometimes|exists:insumos,id',
            'cantidad_teorica' => 'sometimes|numeric|min:0.01',
            'unidades_base' => 'sometimes|integer|min:1'
        ]);
    
        $receta->update($validated);
        return response()->json($receta->load(['productoFinal', 'insumo']));
    }

    public function destroy($id)
    {
        $receta = Receta::findOrFail($id);
        $receta->delete();
        return response()->json(null, 204);
    }

    // Método adicional: recetas por producto
    public function byProducto($productoId)
    {
        $recetas = Receta::with(['insumo'])
            ->where('producto_final_id', $productoId)
            ->get();
        return response()->json($recetas);
    }
}
