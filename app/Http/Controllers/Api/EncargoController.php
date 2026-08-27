<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Encargo;
use App\Models\Venta;
use Illuminate\Http\Request;

class EncargoController extends Controller
{
    public function index()
    {
        return response()->json(Encargo::with(['cliente', 'productoFinal'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'producto_final_id' => 'required|exists:productos_finales,id',
            'cantidad' => 'required|integer|min:1',
            'precio_acordado' => 'required|numeric|min:0',
            'fecha_entrega' => 'required|date|after:now'
        ]);

        $validated['estado'] = 'pendiente';
        $encargo = Encargo::create($validated);
        return response()->json($encargo->load(['cliente', 'productoFinal']), 201);

        // Enviar notificación push
        $this->enviarNotificacion(
            '📅 Nuevo encargo',
            "{$cliente->nombre} - {$cantidad} uds para " . $fechaEntrega->format('H:i'),
            '/encargos'
        );
    }

    public function show($id)
    {
        $encargo = Encargo::with(['cliente', 'productoFinal'])->findOrFail($id);
        return response()->json($encargo);
    }

    public function update(Request $request, $id)
    {
        $encargo = Encargo::findOrFail($id);
        
        $validated = $request->validate([
            'cliente_id' => 'sometimes|exists:clientes,id',
            'producto_final_id' => 'sometimes|exists:productos_finales,id',
            'cantidad' => 'sometimes|integer|min:1',
            'precio_acordado' => 'sometimes|numeric|min:0',
            'fecha_entrega' => 'sometimes|date|after:now',
            'estado' => 'sometimes|in:pendiente,listo,entregado'
        ]);

        $encargo->update($validated);
        return response()->json($encargo->load(['cliente', 'productoFinal']));
    }

    public function destroy($id)
    {
        $encargo = Encargo::findOrFail($id);
        $encargo->delete();
        return response()->json(null, 204);
    }

    // Método: marcar encargo como entregado y convertirlo en venta
    public function entregar($id)
    {
        $encargo = Encargo::findOrFail($id);
        
        if ($encargo->estado === 'entregado') {
            return response()->json(['error' => 'Este encargo ya fue entregado'], 400);
        }

        // Crear la venta
        $venta = Venta::create([
            'cliente_id' => $encargo->cliente_id,
            'producto_final_id' => $encargo->producto_final_id,
            'cantidad' => $encargo->cantidad,
            'precio_unitario' => $encargo->precio_acordado,
            'total' => $encargo->cantidad * $encargo->precio_acordado,
            'metodo_pago' => 'efectivo', // Por defecto, se puede editar después
            'fecha_hora' => now()
        ]);

        // Actualizar estado del encargo
        $encargo->estado = 'entregado';
        $encargo->save();

        return response()->json([
            'encargo' => $encargo->load(['cliente', 'productoFinal']),
            'venta' => $venta->load(['cliente', 'productoFinal'])
        ]);
    }

    // Método: encargos próximos (para recordatorios)
    public function proximos()
    {
        $encargos = Encargo::with(['cliente', 'productoFinal'])
            ->where('estado', 'pendiente')
            ->where('fecha_entrega', '<=', now()->addHours(24))
            ->orderBy('fecha_entrega', 'asc')
            ->get();
        return response()->json($encargos);
    }
    private function enviarNotificacion($titulo, $mensaje, $url = '/')
    {
        // Aquí se enviaría la notificación push a todos los suscriptores
        // Por ahora solo guardamos en log
        Log::info("📢 Notificación: {$titulo} - {$mensaje}");
    }
}