<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GastoOperativo;
use App\Models\CategoriaGasto;
use App\Models\Ciclo;
use Illuminate\Http\Request;

class GastoOperativoController extends Controller
{
    public function index(Request $request)
    {
        $query = GastoOperativo::with(['categoria', 'ciclo']);

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }
        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }
        if ($request->filled('ciclo_id')) {
            $query->where('ciclo_id', $request->ciclo_id);
        }

        return response()->json($query->orderBy('fecha', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'concepto' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'monto' => 'required|numeric|min:0.01',
            'fecha' => 'required|date',
            'categoria_id' => 'nullable|exists:categorias_gastos,id',
            'ciclo_id' => 'nullable|exists:ciclos,id',
            'tipo' => 'sometimes|in:gasto,inversion_extra'
        ]);

        // Si no se especifica ciclo, asignar al actual
        if (empty($validated['ciclo_id'])) {
            $cicloActual = Ciclo::getCicloActual();
            if ($cicloActual) {
                $validated['ciclo_id'] = $cicloActual->id;
            }
        }

        $gasto = GastoOperativo::create($validated);

        // Si el gasto está asignado a un ciclo, recalcular ganancias
        if ($gasto->ciclo_id) {
            $gasto->ciclo->calcularGanancias();
        }

        return response()->json($gasto->load(['categoria', 'ciclo']), 201);
    }

    public function show($id)
    {
        $gasto = GastoOperativo::with(['categoria', 'ciclo'])->findOrFail($id);
        return response()->json($gasto);
    }

    public function update(Request $request, $id)
    {
        $gasto = GastoOperativo::findOrFail($id);

        $validated = $request->validate([
            'concepto' => 'sometimes|string|max:255',
            'descripcion' => 'nullable|string',
            'monto' => 'sometimes|numeric|min:0.01',
            'fecha' => 'sometimes|date',
            'categoria_id' => 'nullable|exists:categorias_gastos,id',
            'ciclo_id' => 'nullable|exists:ciclos,id',
            'tipo' => 'sometimes|in:gasto,inversion_extra'
        ]);

        $gasto->update($validated);

        // Recalcular ganancias del ciclo
        if ($gasto->ciclo_id) {
            $gasto->ciclo->calcularGanancias();
        }

        return response()->json($gasto->load(['categoria', 'ciclo']));
    }

    public function destroy($id)
    {
        $gasto = GastoOperativo::findOrFail($id);
        $cicloId = $gasto->ciclo_id;
        $gasto->delete();

        // Recalcular ganancias del ciclo
        if ($cicloId) {
            $ciclo = Ciclo::find($cicloId);
            if ($ciclo) {
                $ciclo->calcularGanancias();
            }
        }

        return response()->json(null, 204);
    }
}
