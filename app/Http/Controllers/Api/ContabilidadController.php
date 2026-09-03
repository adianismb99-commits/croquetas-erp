<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ciclo;
use App\Models\Venta;
use App\Models\LoteInsumo;
use App\Models\GastoOperativo;
use Illuminate\Http\Request;

class ContabilidadController extends Controller
{
    // Dashboard de contabilidad
    public function dashboard()
    {
        $cicloActual = Ciclo::getCicloActual();
        if ($cicloActual) {
            $cicloActual->calcularGanancias();
        }

        $ciclosCerrados = Ciclo::where('estado', 'cerrado')->get();

        $totalInversion = $ciclosCerrados->sum('inversion_total');
        $totalIngresos = $ciclosCerrados->sum('ingresos_totales');
        $totalGastos = $ciclosCerrados->sum('gastos_operativos');
        $totalGanancia = $ciclosCerrados->sum('ganancia_neta');

        if ($cicloActual) {
            $totalInversion += $cicloActual->inversion_total;
            $totalIngresos += $cicloActual->ingresos_totales;
            $totalGastos += $cicloActual->gastos_operativos;
            $totalGanancia += $cicloActual->ganancia_neta;
        }

        return response()->json([
            'ciclo_actual' => $cicloActual,
            'ciclos_cerrados' => $ciclosCerrados,
            'resumen' => [
                'total_inversion' => $totalInversion,
                'total_ingresos' => $totalIngresos,
                'total_gastos' => $totalGastos,
                'total_ganancia' => $totalGanancia,
                'total_ciclos' => $ciclosCerrados->count(),
                'rentabilidad' => $totalIngresos > 0 ? ($totalGanancia / $totalIngresos) * 100 : 0
            ]
        ]);
    }

    // Reportes por período
    public function reporte(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:dia,semana,mes,personalizado,ciclo',
            'fecha_desde' => 'required_if:tipo,personalizado|date',
            'fecha_hasta' => 'required_if:tipo,personalizado|date|after_or_equal:fecha_desde',
            'ciclo_id' => 'required_if:tipo,ciclo|exists:ciclos,id'
        ]);

        $tipo = $request->tipo;

        switch ($tipo) {
            case 'dia':
                $fecha = now()->toDateString();
                $ventas = Venta::whereDate('fecha_hora', $fecha)->get();
                $compras = LoteInsumo::whereDate('created_at', $fecha)->where('es_inversion', true)->get();
                $gastos = GastoOperativo::whereDate('fecha', $fecha)->get();
                break;

            case 'semana':
                $inicio = now()->startOfWeek();
                $fin = now()->endOfWeek();
                $ventas = Venta::whereBetween('fecha_hora', [$inicio, $fin])->get();
                $compras = LoteInsumo::whereBetween('created_at', [$inicio, $fin])->where('es_inversion', true)->get();
                $gastos = GastoOperativo::whereBetween('fecha', [$inicio, $fin])->get();
                break;

            case 'mes':
                $inicio = now()->startOfMonth();
                $fin = now()->endOfMonth();
                $ventas = Venta::whereBetween('fecha_hora', [$inicio, $fin])->get();
                $compras = LoteInsumo::whereBetween('created_at', [$inicio, $fin])->where('es_inversion', true)->get();
                $gastos = GastoOperativo::whereBetween('fecha', [$inicio, $fin])->get();
                break;

            case 'personalizado':
                $ventas = Venta::whereBetween('fecha_hora', [$request->fecha_desde, $request->fecha_hasta])->get();
                $compras = LoteInsumo::whereBetween('created_at', [$request->fecha_desde, $request->fecha_hasta])->where('es_inversion', true)->get();
                $gastos = GastoOperativo::whereBetween('fecha', [$request->fecha_desde, $request->fecha_hasta])->get();
                break;

            case 'ciclo':
                $ciclo = Ciclo::with(['ventas', 'lotes', 'gastos'])->findOrFail($request->ciclo_id);
                return response()->json([
                    'ciclo' => $ciclo,
                    'resumen' => [
                        'inversion' => $ciclo->inversion_total,
                        'ingresos' => $ciclo->ingresos_totales,
                        'ganancia_bruta' => $ciclo->ganancia_bruta,
                        'gastos' => $ciclo->gastos_operativos,
                        'ganancia_neta' => $ciclo->ganancia_neta,
                        'rentabilidad' => $ciclo->porcentaje_rentabilidad
                    ]
                ]);
                break;
        }

        $totalInversion = $compras->sum('precio_total');
        $totalIngresos = $ventas->sum('total');
        $totalGastos = $gastos->sum('monto');
        $gananciaBruta = $totalIngresos - $totalInversion;
        $gananciaNeta = $gananciaBruta - $totalGastos;

        return response()->json([
            'periodo' => [
                'tipo' => $tipo,
                'fecha_inicio' => $request->fecha_desde ?? $inicio ?? null,
                'fecha_fin' => $request->fecha_hasta ?? $fin ?? null
            ],
            'resumen' => [
                'inversion' => $totalInversion,
                'ingresos' => $totalIngresos,
                'ganancia_bruta' => $gananciaBruta,
                'gastos' => $totalGastos,
                'ganancia_neta' => $gananciaNeta,
                'rentabilidad' => $totalIngresos > 0 ? ($gananciaNeta / $totalIngresos) * 100 : 0
            ],
            'ventas' => $ventas,
            'compras' => $compras,
            'gastos' => $gastos
        ]);
    }

    // Datos para gráficos
    public function graficos()
    {
        $ciclos = Ciclo::where('estado', 'cerrado')
            ->orderBy('fecha_inicio', 'asc')
            ->get();

        $cicloActual = Ciclo::getCicloActual();
        if ($cicloActual) {
            $cicloActual->calcularGanancias();
        }

        // Evolución de ganancia neta
        $evolucion = $ciclos->map(function($ciclo) {
            return [
                'codigo' => $ciclo->codigo,
                'ganancia_neta' => $ciclo->ganancia_neta,
                'rentabilidad' => $ciclo->porcentaje_rentabilidad
            ];
        });

        // Distribución de gastos por categoría
        $gastos = GastoOperativo::with('categoria')->get();
        $distribucion = $gastos->groupBy('categoria_id')->map(function($items) {
            $categoria = $items->first()->categoria;
            return [
                'categoria' => $categoria ? $categoria->nombre : 'Sin categoría',
                'total' => $items->sum('monto'),
                'color' => $categoria ? $categoria->color : '#6B3FA0'
            ];
        })->values();

        // Ventas vs Inversión por ciclo
        $comparativa = $ciclos->map(function($ciclo) {
            return [
                'codigo' => $ciclo->codigo,
                'inversion' => $ciclo->inversion_total,
                'ingresos' => $ciclo->ingresos_totales,
                'ganancia' => $ciclo->ganancia_neta
            ];
        });

        // Datos del ciclo actual
        $actual = null;
        if ($cicloActual) {
            $actual = [
                'codigo' => $cicloActual->codigo,
                'inversion' => $cicloActual->inversion_total,
                'ingresos' => $cicloActual->ingresos_totales,
                'ganancia_bruta' => $cicloActual->ganancia_bruta,
                'ganancia_neta' => $cicloActual->ganancia_neta,
                'rentabilidad' => $cicloActual->porcentaje_rentabilidad
            ];
        }

        return response()->json([
            'evolucion' => $evolucion,
            'distribucion_gastos' => $distribucion,
            'comparativa_ciclos' => $comparativa,
            'ciclo_actual' => $actual,
            'total_ciclos' => $ciclos->count()
        ]);
    }
}
