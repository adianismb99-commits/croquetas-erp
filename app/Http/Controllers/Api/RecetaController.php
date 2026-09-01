<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receta;
use Illuminate\Http\Request;

class RecetaController extends Controller
{
    public function index()
    {
        // Agrupar recetas por producto
        $recetas = Receta::with(['productoFinal', 'insumo'])
            ->orderBy('created_at', 'desc')
            ->get();
        $agrupadas = $recetas->groupBy('producto_final_id')->map(function($items) {
            $producto = $items->first()->productoFinal;
            return [
                'producto' => $producto,
                'insumos' => $items->map(function($item) {
                    return [
                        'id' => $item->id,
                        'insumo' => $item->insumo,
                        'cantidad_teorica' => $item->cantidad_teorica,
                        'unidades_base' => $item->unidades_base
                    ];
                })
            ];
        });
        return response()->json($agrupadas->values());
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
    
        // Crear NUEVAS recetas (no actualizar)
        $recetasCreadas = [];
        foreach ($validated['insumos'] as $insumoData) {
            $receta = Receta::create([
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
