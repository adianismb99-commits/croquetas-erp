<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoteInsumo;
use App\Models\Insumo;
use App\Models\Proveedor;
use App\Models\Movimiento;
use Illuminate\Http\Request;

class CompraController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = LoteInsumo::with(['insumo', 'proveedor']);

            if ($request->filled('fecha_desde')) {
                $query->whereDate('fecha_compra', '>=', $request->fecha_desde);
            }
            if ($request->filled('fecha_hasta')) {
                $query->whereDate('fecha_compra', '<=', $request->fecha_hasta);
            }
            if ($request->filled('proveedor')) {
                $query->whereHas('proveedor', function($q) use ($request) {
                    $q->where('nombre', 'like', '%' . $request->proveedor . '%');
                });
            }
            if ($request->filled('insumo')) {
                $query->whereHas('insumo', function($q) use ($request) {
                    $q->where('nombre', 'like', '%' . $request->insumo . '%');
                });
            }

            $compras = $query->orderBy('fecha_compra', 'desc')->get();

            return response()->json($compras);
        } catch (\Exception $e) {
            \Log::error('Error en index de Compras: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            \Log::info('📦 Iniciando registro de compra', $request->all());

            $validated = $request->validate([
                'insumo_id' => 'required|exists:insumos,id',
                'proveedor_id' => 'required|exists:proveedores,id',
                'cantidad' => 'required|numeric|min:0.01',
                'costo_unitario' => 'required|numeric|min:0.01',
                'fecha_compra' => 'required|date'
            ]);

            \Log::info('✅ Validación pasada', $validated);

            $insumo = Insumo::findOrFail($validated['insumo_id']);
            $prefijo = strtoupper(substr($insumo->nombre, 0, 3));
            
            $ultimo = LoteInsumo::where('codigo', 'like', $prefijo . '-%')
                ->orderBy('codigo', 'desc')
                ->first();
            
            if ($ultimo && preg_match('/' . $prefijo . '-(\d+)/', $ultimo->codigo, $matches)) {
                $numero = intval($matches[1]) + 1;
            } else {
                $numero = 1;
            }
            
            $validated['codigo'] = $prefijo . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
            $validated['precio_total'] = $validated['cantidad'] * $validated['costo_unitario'];
            $validated['stock_restante'] = $validated['cantidad'];

            \Log::info('📦 Creando lote', $validated);

            $lote = LoteInsumo::create($validated);

            \Log::info('✅ Lote creado', ['id' => $lote->id]);

            // Registrar movimiento de compra
            Movimiento::create([
                'codigo' => $lote->codigo,
                'tipo' => 'compra',
                'producto_id' => $lote->insumo_id,
                'producto_tipo' => 'insumo',
                'producto_nombre' => $lote->insumo->nombre,
                'unidad' => $lote->insumo->unidad,
                'cantidad' => $lote->cantidad,
                'entrada' => $lote->cantidad,
                'salida' => 0,
                'saldo' => $lote->stock_restante,
                'detalle' => "Compra a: {$lote->proveedor->nombre}",
                'costo_total' => $lote->precio_total,
                'fecha' => $lote->fecha_compra
            ]);

            \Log::info('✅ Movimiento creado');

            return response()->json($lote->load(['insumo', 'proveedor']), 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ Error de validación', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('❌ Error al crear compra', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function resumen()
    {
        try {
            $totalCompras = LoteInsumo::sum('precio_total');
            $totalInsumos = LoteInsumo::sum('cantidad');
            $comprasEsteMes = LoteInsumo::whereMonth('fecha_compra', now()->month)
                ->whereYear('fecha_compra', now()->year)
                ->count();

            $proveedorMasUsado = LoteInsumo::with('proveedor')
                ->selectRaw('proveedor_id, COUNT(*) as total')
                ->groupBy('proveedor_id')
                ->orderBy('total', 'desc')
                ->first();

            $porProveedor = LoteInsumo::with('proveedor')
                ->selectRaw('proveedor_id, SUM(precio_total) as total_gastado, COUNT(*) as total_compras')
                ->groupBy('proveedor_id')
                ->orderBy('total_gastado', 'desc')
                ->get()
                ->map(function($item) {
                    return [
                        'proveedor' => $item->proveedor->nombre,
                        'total_compras' => $item->total_compras,
                        'total_gastado' => $item->total_gastado
                    ];
                });

            return response()->json([
                'total_compras' => $totalCompras,
                'total_insumos' => $totalInsumos,
                'compras_este_mes' => $comprasEsteMes,
                'proveedor_mas_usado' => $proveedorMasUsado ? $proveedorMasUsado->proveedor->nombre : 'Ninguno',
                'por_proveedor' => $porProveedor
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en resumen de Compras: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
