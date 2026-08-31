<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProveedorController extends Controller
{
    public function index()
    {
        return response()->json(Proveedor::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string'
        ]);

        $proveedor = Proveedor::create($validated);
        return response()->json($proveedor, 201);
    }

    public function show($id)
    {
        $proveedor = Proveedor::findOrFail($id);
        return response()->json($proveedor);
    }

    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string'
        ]);

        $proveedor->update($validated);
        return response()->json($proveedor);
    }

    public function destroy($id)
    {
        $proveedor = Proveedor::findOrFail($id);
        $proveedor->delete();
        return response()->json(null, 204);
    }
}
