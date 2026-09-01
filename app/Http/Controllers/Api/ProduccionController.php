<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produccion;
use App\Models\ProduccionLote;
use App\Models\LoteInsumo;
use App\Models\Receta;
use App\Models\Movimiento;
use App\Models\ProductoFinal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProduccionController extends Controller
{
    public function index()
    {
        $producciones = Produccion::with([
            'productoFinal',
            'produccionLotes' => function($query) {
                $query->with(['loteInsumo' => function($q) {
                    $q->withTrashed();
                }, 'loteInsumo.insumo']);
            }
        ])
        ->orderBy('created_at', 'desc')
        ->get();
    
        foreach ($producciones as $produccion) {
            // Obtener recetas con código de insumo como clave
            $recetas = Receta::with('insumo')
                ->where('producto_final_id', $produccion->producto_final_id)
                ->get()
                ->keyBy(function($item) {
                    return $item->insumo->codigo;
                })
                ->toArray();
    
            foreach ($produccion->produccionLotes as $pl) {
                $insumo = $pl->loteInsumo->insumo;
                $codigoInsumo = $insumo->codigo ?? null;
                
                if ($codigoInsumo && isset($recetas[$codigoInsumo])) {
                    $receta = $recetas[$codigoInsumo];
                    $factor = $produccion->cantidad / $receta['unidades_base'];
                    $pl->cantidad_teorica = $receta['cantidad_teorica'] * $factor;
                    $pl->unidades_base = $receta['unidades_base'];
                } else {
                    $pl->cantidad_teorica = 0;
                    $pl->unidades_base = 0;
                }
            }
        }
    
        return response()->json($producciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_final_id' => 'required|exists:productos_finales,id',
            'cantidad' => 'required|integer|min:1',
            'fecha_hora' => 'required|date',
            'lotes' => 'required|array|min:1',
            'lotes.*.lote_insumo_id' => 'required|exists:lotes_insumos,id',
            'lotes.*.cantidad_usada' => 'required|numeric|min:0.01'
        ]);

        DB::beginTransaction();
        try {
            $codigo = Produccion::generarCodigo($validated['producto_final_id']);

            $produccion = Produccion::create([
                'codigo' => $codigo,
                'producto_final_id' => $validated['producto_final_id'],
                'cantidad' => $validated['cantidad'],
                'fecha_hora' => $validated['fecha_hora'],
                'costo_teorico' => 0,
                'costo_real' => 0,
                'diferencia' => 0,
                'porcentaje_variacion' => 0
            ]);

            $totalReal = 0;
            $totalTeorico = 0;
            $producto = ProductoFinal::find($validated['producto_final_id']);

            // Obtener recetas con código de insumo como clave
            $recetas = Receta::with('insumo')
                ->where('producto_final_id', $validated['producto_final_id'])
                ->get()
                ->keyBy(function($item) {
                    return $item->insumo->codigo;
                })
                ->toArray();

            foreach ($validated['lotes'] as $loteData) {
                $lote = LoteInsumo::findOrFail($loteData['lote_insumo_id']);
                
                if ($lote->stock_restante < $loteData['cantidad_usada']) {
                    throw new \Exception("Stock insuficiente en lote {$lote->codigo}");
                }

                $costoUnitario = $lote->precio_total / $lote->cantidad;
                $costoTotal = $costoUnitario * $loteData['cantidad_usada'];
                $totalReal += $costoTotal;

                // Buscar receta por código de insumo
                $codigoInsumo = $lote->insumo->codigo;
                $costoTeorico = 0;
                if (isset($recetas[$codigoInsumo])) {
                    $receta = $recetas[$codigoInsumo];
                    $factor = $validated['cantidad'] / $receta['unidades_base'];
                    $cantidadTeorica = $receta['cantidad_teorica'] * $factor;
                    $costoTeorico = $cantidadTeorica * $costoUnitario;
                    $totalTeorico += $costoTeorico;
                }

                ProduccionLote::create([
                    'produccion_id' => $produccion->id,
                    'lote_insumo_id' => $loteData['lote_insumo_id'],
                    'cantidad_usada' => $loteData['cantidad_usada'],
                    'costo_unitario' => $costoUnitario,
                    'costo_total' => $costoTotal
                ]);

                $lote->stock_restante -= $loteData['cantidad_usada'];
                $lote->save();

                Movimiento::create([
                    'codigo' => $produccion->codigo,
                    'tipo' => 'uso_insumo',
                    'producto_id' => $lote->insumo_id,
                    'producto_tipo' => 'insumo',
                    'producto_nombre' => $lote->insumo->nombre,
                    'unidad' => $lote->insumo->unidad,
                    'cantidad' => $loteData['cantidad_usada'],
                    'entrada' => 0,
                    'salida' => $loteData['cantidad_usada'],
                    'saldo' => $lote->stock_restante,
                    'detalle' => "Producción {$produccion->codigo} - {$producto->nombre}",
                    'costo_total' => $costoTotal,
                    'fecha' => $validated['fecha_hora']
                ]);
            }

            $diferencia = $totalReal - $totalTeorico;
            $porcentajeVariacion = $totalTeorico > 0 ? ($diferencia / $totalTeorico) * 100 : 0;

            $produccion->costo_teorico = $totalTeorico;
            $produccion->costo_real = $totalReal;
            $produccion->diferencia = $diferencia;
            $produccion->porcentaje_variacion = $porcentajeVariacion;
            $produccion->save();

            Movimiento::create([
                'codigo' => $produccion->codigo,
                'tipo' => 'produccion',
                'producto_id' => $validated['producto_final_id'],
                'producto_tipo' => 'producto_final',
                'producto_nombre' => $producto->nombre,
                'unidad' => 'ud',
                'cantidad' => $validated['cantidad'],
                'entrada' => $validated['cantidad'],
                'salida' => 0,
                'saldo' => 0,
                'detalle' => "Producción de {$producto->nombre} - Costo real: \${$totalReal}",
                'costo_total' => $totalReal,
                'fecha' => $validated['fecha_hora']
            ]);

            $this->actualizarSaldoProducto($validated['producto_final_id']);

            DB::commit();
            return response()->json($produccion->load(['productoFinal', 'produccionLotes.loteInsumo.insumo']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    private function actualizarSaldoProducto($productoId)
    {
        $movimientos = Movimiento::where('producto_id', $productoId)
            ->where('producto_tipo', 'producto_final')
            ->orderBy('fecha', 'asc')
            ->get();

        $saldo = 0;
        foreach ($movimientos as $movimiento) {
            $saldo += $movimiento->entrada - $movimiento->salida;
            $movimiento->saldo = $saldo;
            $movimiento->save();
        }
    }

    public function show($id)
    {
        $produccion = Produccion::with([
            'productoFinal',
            'produccionLotes' => function($query) {
                $query->with(['loteInsumo' => function($q) {
                    $q->withTrashed(); // Incluir lotes eliminados
                }, 'loteInsumo.insumo']);
            }
        ])->findOrFail($id);
    
        // Obtener recetas con código de insumo como clave
        $recetas = Receta::with('insumo')
            ->where('producto_final_id', $produccion->producto_final_id)
            ->get()
            ->keyBy(function($item) {
                return $item->insumo->codigo;
            })
            ->toArray();
    
        foreach ($produccion->produccionLotes as $pl) {
            $insumo = $pl->loteInsumo?->insumo;
            $codigoInsumo = $insumo?->codigo ?? null;
            
            if ($codigoInsumo && isset($recetas[$codigoInsumo])) {
                $receta = $recetas[$codigoInsumo];
                $factor = $produccion->cantidad / $receta['unidades_base'];
                $pl->cantidad_teorica = $receta['cantidad_teorica'] * $factor;
                $pl->unidades_base = $receta['unidades_base'];
            } else {
                $pl->cantidad_teorica = 0;
                $pl->unidades_base = 0;
            }
        }
    
        return response()->json($produccion);
    }


    public function destroy($id)
    {
        $produccion = Produccion::findOrFail($id);
        
        DB::beginTransaction();
        try {
            foreach ($produccion->produccionLotes as $pl) {
                $lote = $pl->loteInsumo;
                $lote->stock_restante += $pl->cantidad_usada;
                $lote->save();
                $pl->delete();
            }

            Movimiento::where('codigo', $produccion->codigo)->delete();
            $produccion->delete();
            DB::commit();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function hoy()
    {
        $hoy = now()->toDateString();
        $producciones = Produccion::with([
            'productoFinal',
            'produccionLotes.loteInsumo.insumo'
        ])->whereDate('fecha_hora', $hoy)->get();

        $recetas = Receta::whereIn('producto_final_id', $producciones->pluck('producto_final_id'))
            ->get()
            ->groupBy('producto_final_id')
            ->map(function($items) {
                return $items->keyBy('insumo_id')->toArray();
            })
            ->toArray();

        foreach ($producciones as $produccion) {
            $recetasProducto = $recetas[$produccion->producto_final_id] ?? [];
            foreach ($produccion->produccionLotes as $pl) {
                $insumoId = $pl->loteInsumo->insumo_id ?? null;
                if ($insumoId && isset($recetasProducto[$insumoId])) {
                    $receta = $recetasProducto[$insumoId];
                    $factor = $produccion->cantidad / $receta['unidades_base'];
                    $pl->cantidad_teorica = $receta['cantidad_teorica'] * $factor;
                } else {
                    $pl->cantidad_teorica = 0;
                }
            }
        }

        return response()->json($producciones);
    }
}
