<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receta;
use App\Models\ProductoFinal;
use Illuminate\Http\Request;

class RecetaController extends Controller
{
    public function index()
    {
        try {
            $recetas = Receta::with(['productoFinal', 'insumo'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Agrupar por código de receta (todas las recetas con el mismo código son una sola receta)
            $agrupadas = $recetas->groupBy('codigo')->map(function($items) {
                $primera = $items->first();
                return [
                    'id' => $primera->id,  // ID de la primera receta (para editar)
                    'codigo' => $primera->codigo,
                    'producto' => $primera->productoFinal,
                    'unidades_base' => $primera->unidades_base,
                    'insumos' => $items->map(function($item) {
                        return [
                            'id' => $item->id,
                            'insumo' => $item->insumo,
                            'cantidad_teorica' => $item->cantidad_teorica
                        ];
                    })
                ];
            })->values();

            return response()->json($agrupadas);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'producto_final_id' => 'required|exists:productos_finales,id',
                'insumos' => 'required|array|min:1',
                'insumos.*.insumo_id' => 'required|exists:insumos,id',
                'insumos.*.cantidad_teorica' => 'required|numeric|min:0.01',
                'unidades_base' => 'required|integer|min:1'
            ]);
    
            // Obtener el producto para el prefijo
            $producto = ProductoFinal::findOrFail($validated['producto_final_id']);
            $prefijoProducto = strtoupper(substr($producto->nombre, 0, 3));
            
            // Formato: CPO-REC-001
            $prefijo = $prefijoProducto . '-REC';
            
            // Generar código único
            $ultimo = Receta::where('codigo', 'like', $prefijo . '-%')
                ->orderBy('codigo', 'desc')
                ->first();
            
            if ($ultimo && preg_match('/' . $prefijo . '-(\d+)/', $ultimo->codigo, $matches)) {
                $numero = intval($matches[1]) + 1;
            } else {
                $numero = 1;
            }
            $codigo = $prefijo . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    
            // Verificar que no exista
            while (Receta::where('codigo', $codigo)->exists()) {
                $numero++;
                $codigo = $prefijo . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
            }
    
            $recetasCreadas = [];
            foreach ($validated['insumos'] as $insumoData) {
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
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function show($id)
    {
        try {
            // Buscar TODAS las recetas con el mismo código
            $receta = Receta::with(['productoFinal', 'insumo'])->findOrFail($id);
            $todas = Receta::with(['productoFinal', 'insumo'])
                ->where('codigo', $receta->codigo)
                ->get();

            return response()->json([
                'id' => $receta->id,
                'codigo' => $receta->codigo,
                'producto' => $receta->productoFinal,
                'unidades_base' => $receta->unidades_base,
                'insumos' => $todas->map(function($item) {
                    return [
                        'id' => $item->id,
                        'insumo' => $item->insumo,
                        'cantidad_teorica' => $item->cantidad_teorica
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Buscar la receta por ID
            $receta = Receta::findOrFail($id);
            
            // Buscar todas las recetas con el mismo código
            $recetas = Receta::where('codigo', $receta->codigo)->get();
            
            // Validar los datos
            $validated = $request->validate([
                'insumos' => 'required|array|min:1',
                'insumos.*.insumo_id' => 'required|exists:insumos,id',
                'insumos.*.cantidad_teorica' => 'required|numeric|min:0.01',
                'unidades_base' => 'required|integer|min:1'
            ]);

            // Eliminar las recetas viejas
            foreach ($recetas as $r) {
                $r->delete();
            }

            // Crear nuevas recetas con el mismo código
            $recetasCreadas = [];
            foreach ($validated['insumos'] as $insumoData) {
                $nueva = Receta::create([
                    'codigo' => $receta->codigo,
                    'producto_final_id' => $receta->producto_final_id,
                    'insumo_id' => $insumoData['insumo_id'],
                    'cantidad_teorica' => $insumoData['cantidad_teorica'],
                    'unidades_base' => $validated['unidades_base']
                ]);
                $recetasCreadas[] = $nueva;
            }

            return response()->json($recetasCreadas, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $receta = Receta::findOrFail($id);
            
            // Eliminar TODAS las recetas con el mismo código
            Receta::where('codigo', $receta->codigo)->delete();
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function byProducto($productoId)
    {
        try {
            $recetas = Receta::with(['insumo'])
                ->where('producto_final_id', $productoId)
                ->get();
            return response()->json($recetas);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
