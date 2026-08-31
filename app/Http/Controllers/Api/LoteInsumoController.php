<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoteInsumo;
use App\Models\Insumo;
use App\Models\Movimiento;
use Illuminate\Http\Request;

class LoteInsumoController extends Controller
{
    public function index()
    {
        return response()->json(LoteInsumo::with(['insumo', 'proveedor'])
            ->orderBy('created_at', 'desc')
            ->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'insumo_id' => 'required|exists:insumos,id',
            'proveedor_id' => 'required|exists:proveedores,id',
            'cantidad' => 'required|numeric|min:0.01',
            'costo_unitario' => 'required|numeric|min:0.01',
            'fecha_compra' => 'required|date'
        ]);

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

        $lote = LoteInsumo::create($validated);

        // Registrar movimiento de compra
        $this->registrarMovimientoCompra($lote);

        return response()->json($lote->load(['insumo', 'proveedor']), 201);
    }

    private function registrarMovimientoCompra($lote)
    {
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
    }

    public function show($id)
    {
        $lote = LoteInsumo::with(['insumo', 'proveedor'])->findOrFail($id);
        return response()->json($lote);
    }

    public function update(Request $request, $id)
    {
        $lote = LoteInsumo::findOrFail($id);
        
        $validated = $request->validate([
            'insumo_id' => 'sometimes|exists:insumos,id',
            'proveedor_id' => 'sometimes|exists:proveedores,id',
            'cantidad' => 'sometimes|numeric|min:0.01',
            'costo_unitario' => 'sometimes|numeric|min:0.01',
            'fecha_compra' => 'sometimes|date',
            'stock_restante' => 'sometimes|numeric|min:0'
        ]);

        if (isset($validated['costo_unitario'])) {
            $cantidad = $validated['cantidad'] ?? $lote->cantidad;
            $validated['precio_total'] = $cantidad * $validated['costo_unitario'];
        }

        $lote->update($validated);
        return response()->json($lote->load(['insumo', 'proveedor']));
    }

    public function destroy($id)
    {
        $lote = LoteInsumo::findOrFail($id);
        $lote->delete();
        return response()->json(null, 204);
    }

    public function disponibles()
    {
        $lotes = LoteInsumo::with(['insumo', 'proveedor'])
            ->where('stock_restante', '>', 0)
            ->get();
        return response()->json($lotes);
    }
}
