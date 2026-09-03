<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaGasto;
use Illuminate\Http\Request;

class CategoriaGastoController extends Controller
{
    public function index()
    {
        return response()->json(CategoriaGasto::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias_gastos,nombre',
            'descripcion' => 'nullable|string',
            'color' => 'nullable|string'
        ]);

        $categoria = CategoriaGasto::create($validated);
        return response()->json($categoria, 201);
    }

    public function show($id)
    {
        $categoria = CategoriaGasto::findOrFail($id);
        return response()->json($categoria);
    }

    public function update(Request $request, $id)
    {
        $categoria = CategoriaGasto::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255|unique:categorias_gastos,nombre,' . $id,
            'descripcion' => 'nullable|string',
            'color' => 'nullable|string'
        ]);

        $categoria->update($validated);
        return response()->json($categoria);
    }

    public function destroy($id)
    {
        $categoria = CategoriaGasto::findOrFail($id);
        $categoria->delete();
        return response()->json(null, 204);
    }
}
