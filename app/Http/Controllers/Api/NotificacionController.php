<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Encargo;
use App\Models\ProductoFinal;
use App\Models\LoteInsumo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificacionController extends Controller
{
    public function index()
    {
        $notificaciones = [];
        $ahora = now();

        // 1. Encargos próximos (menos de 2 horas)
        $encargosProximos = Encargo::with(['cliente', 'productoFinal'])
            ->where('estado', 'pendiente')
            ->where('fecha_entrega', '>=', $ahora)
            ->where('fecha_entrega', '<=', $ahora->addHours(2))
            ->get();

        foreach ($encargosProximos as $encargo) {
            $tiempoRestante = $ahora->diffInMinutes($encargo->fecha_entrega);
            $horas = floor($tiempoRestante / 60);
            $minutos = $tiempoRestante % 60;
            
            $notificaciones[] = [
                'id' => $encargo->id,
                'tipo' => 'encargo_proximo',
                'titulo' => 'Encargo próximo',
                'mensaje' => "{$encargo->cliente->nombre} - {$encargo->cantidad} uds de {$encargo->productoFinal->nombre}",
                'tiempo' => "Entrega en {$horas}h {$minutos}min",
                'fecha_entrega' => $encargo->fecha_entrega,
                'leido' => false,
                'accion' => '/encargos'
            ];
        }

        // 2. Encargos para hoy
        $encargosHoy = Encargo::with(['cliente', 'productoFinal'])
            ->where('estado', 'pendiente')
            ->whereDate('fecha_entrega', $ahora->toDateString())
            ->where('fecha_entrega', '>', $ahora)
            ->get();

        foreach ($encargosHoy as $encargo) {
            // Evitar duplicados con los próximos
            $existe = false;
            foreach ($notificaciones as $n) {
                if ($n['id'] == $encargo->id) {
                    $existe = true;
                    break;
                }
            }
            if (!$existe) {
                $notificaciones[] = [
                    'id' => $encargo->id,
                    'tipo' => 'encargo_hoy',
                    'titulo' => 'Encargo para hoy',
                    'mensaje' => "{$encargo->cliente->nombre} - {$encargo->cantidad} uds de {$encargo->productoFinal->nombre}",
                    'tiempo' => 'Entrega: ' . $encargo->fecha_entrega->format('H:i'),
                    'fecha_entrega' => $encargo->fecha_entrega,
                    'leido' => false,
                    'accion' => '/encargos'
                ];
            }
        }

        // 3. Stock crítico (insumos)
        $insumosCriticos = LoteInsumo::with(['insumo'])
            ->where('stock_restante', '>', 0)
            ->get()
            ->groupBy('insumo_id')
            ->map(function($lotes) {
                $totalStock = $lotes->sum('stock_restante');
                $insumo = $lotes->first()->insumo;
                return [
                    'insumo' => $insumo->nombre,
                    'stock' => $totalStock,
                    'unidad' => $insumo->unidad,
                    'stock_inicial' => $lotes->sum('cantidad')
                ];
            })
            ->filter(function($item) {
                // Stock crítico: menos del 20% del stock inicial
                $porcentaje = $item['stock_inicial'] > 0 ? ($item['stock'] / $item['stock_inicial']) * 100 : 0;
                return $porcentaje < 20 && $item['stock'] > 0;
            });

        foreach ($insumosCriticos as $item) {
            $notificaciones[] = [
                'id' => 'insumo-' . $item['insumo'],
                'tipo' => 'stock_critico',
                'titulo' => 'Stock crítico',
                'mensaje' => "{$item['insumo']}: {$item['stock']} {$item['unidad']} restantes",
                'tiempo' => '⚠️ Reponer pronto',
                'leido' => false,
                'accion' => '/lotes'
            ];
        }

        // 4. Stock bajo de productos terminados (menos de 50 unidades)
        $productos = ProductoFinal::all();
        foreach ($productos as $producto) {
            $stock = $producto->stock ?? 0;
            if ($stock > 0 && $stock < 50) {
                $notificaciones[] = [
                    'id' => 'producto-' . $producto->id,
                    'tipo' => 'stock_bajo',
                    'titulo' => 'Stock bajo',
                    'mensaje' => "{$producto->nombre}: {$stock} unidades disponibles",
                    'tiempo' => '📦 Reponer pronto',
                    'leido' => false,
                    'accion' => '/almacen/productos-terminados'
                ];
            }
        }

        // Ordenar por fecha de entrega (más urgentes primero)
        usort($notificaciones, function($a, $b) {
            if (!isset($a['fecha_entrega'])) return 1;
            if (!isset($b['fecha_entrega'])) return -1;
            return $a['fecha_entrega'] <=> $b['fecha_entrega'];
        });

        return response()->json([
            'notificaciones' => $notificaciones,
            'total' => count($notificaciones)
        ]);
    }

    public function contar()
    {
        $notificaciones = $this->index()->getData();
        return response()->json([
            'total' => $notificaciones->total
        ]);
    }
    // Métodos para suscripciones
    public function subscribe(Request $request)
    {
        $subscription = $request->input('subscription');
        
        // Guardar en la base de datos (crear tabla si es necesario)
        // Por ahora lo guardamos en un archivo de log
        Log::info('Push subscription:', $subscription);
        
        return response()->json(['success' => true]);
    }

    public function unsubscribe(Request $request)
    {
        Log::info('Push unsubscribed');
        return response()->json(['success' => true]);
    }

    // Enviar notificación push manualmente
    public function sendTest(Request $request)
    {
        // Aquí se enviaría la notificación a todos los suscriptores
        // Por ahora solo simulamos
        return response()->json(['success' => true]);
    }
}