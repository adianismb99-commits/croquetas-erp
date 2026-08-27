<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insumo;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InsumoController extends Controller
{
    public function index()
    {
        return response()->json(Insumo::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'unidad' => 'required|string|max:100',
            'descripcion' => 'nullable|string'
        ]);

        $insumo = Insumo::create($validated);
        return response()->json($insumo, 201);
    }

    public function show($id)
    {
        $insumo = Insumo::findOrFail($id);
        return response()->json($insumo);
    }

    public function update(Request $request, $id)
    {
        $insumo = Insumo::findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'unidad' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string'
        ]);

        $insumo->update($validated);
        return response()->json($insumo);
    }

    public function destroy($id)
    {
        $insumo = Insumo::findOrFail($id);
        $insumo->delete();
        return response()->json(null, 204);
    }
}