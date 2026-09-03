<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ciclo;
use App\Models\LoteInsumo;
use App\Models\Venta;
use App\Models\GastoOperativo;
use Illuminate\Http\Request;

class CicloController extends Controller
{
    // Obtener ciclo actual
    public function actual()
    {
        $ciclo = Ciclo::getCicloActual();

        if (!$ciclo) {
            return response()->json(null, 404);
        }

        $ciclo->calcularGanancias();

        return response()->json($ciclo);
    }

    // Listar todos los ciclos
    public function index()
    {
        $ciclos = Ciclo::where('estado', 'cerrado')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ciclos);
    }

    // Ver detalle de un ciclo
    public function show($id)
    {
        $ciclo = Ciclo::with([
            'lotes.insumo',
            'lotes.proveedor',
            'ventas.cliente',
            'ventas.productoFinal',
            'gastos.categoria'
        ])->findOrFail($id);

        $ciclo->calcularGanancias();

        return response()->json($ciclo);
    }

    // Cerrar ciclo manualmente
    public function cerrar()
    {
        $ciclo = Ciclo::getCicloActual();

        if (!$ciclo) {
            return response()->json(['error' => 'No hay ciclo abierto'], 400);
        }

        $ciclo->cerrar();

        // Crear nuevo ciclo automáticamente
        $nuevoCiclo = Ciclo::create([
            'codigo' => Ciclo::generarCodigo(),
            'numero' => Ciclo::where('codigo', 'like', now()->format('ymd') . '-%')->count() + 1,
            'fecha_inicio' => now(),
            'inversion_total' => 0,
            'estado' => 'abierto'
        ]);

        return response()->json([
            'cerrado' => $ciclo,
            'nuevo' => $nuevoCiclo
        ]);
    }

    // Aumentar inversión (crea nuevo ciclo)
    public function aumentarInversion(Request $request)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0.01',
            'descripcion' => 'nullable|string'
        ]);

        $cicloActual = Ciclo::getCicloActual();

        if (!$cicloActual) {
            return response()->json(['error' => 'No hay ciclo abierto'], 400);
        }

        // Crear gasto de inversión extra
        $gasto = GastoOperativo::create([
            'ciclo_id' => $cicloActual->id,
            'concepto' => 'Aumento de inversión',
            'descripcion' => $request->descripcion ?? 'Inversión extra agregada manualmente',
            'monto' => $request->monto,
            'fecha' => now()->toDateString(),
            'categoria_id' => null,
            'tipo' => 'inversion_extra'
        ]);

        // Cerrar ciclo actual
        $cicloActual->cerrar();

        // Crear nuevo ciclo con la inversión aumentada
        $codigo = Ciclo::generarCodigo();
        $numero = Ciclo::where('codigo', 'like', now()->format('ymd') . '-%')->count() + 1;

        $nuevoCiclo = Ciclo::create([
            'codigo' => $codigo,
            'numero' => $numero,
            'fecha_inicio' => now(),
            'inversion_total' => $cicloActual->inversion_total + $request->monto,
            'estado' => 'abierto'
        ]);

        return response()->json([
            'ciclo_cerrado' => $cicloActual,
            'ciclo_nuevo' => $nuevoCiclo,
            'gasto' => $gasto
        ]);
    }

    // Resumen general
    public function resumen()
    {
        $ciclos = Ciclo::where('estado', 'cerrado')->get();

        $totalInversion = $ciclos->sum('inversion_total');
        $totalIngresos = $ciclos->sum('ingresos_totales');
        $totalGastos = $ciclos->sum('gastos_operativos');
        $totalGanancia = $ciclos->sum('ganancia_neta');

        $cicloActual = Ciclo::getCicloActual();
        if ($cicloActual) {
            $cicloActual->calcularGanancias();
            $totalInversion += $cicloActual->inversion_total;
            $totalIngresos += $cicloActual->ingresos_totales;
            $totalGastos += $cicloActual->gastos_operativos;
            $totalGanancia += $cicloActual->ganancia_neta;
        }

        return response()->json([
            'total_inversion' => $totalInversion,
            'total_ingresos' => $totalIngresos,
            'total_gastos' => $totalGastos,
            'total_ganancia' => $totalGanancia,
            'total_ciclos' => $ciclos->count(),
            'rentabilidad' => $totalIngresos > 0 ? ($totalGanancia / $totalIngresos) * 100 : 0,
            'ciclo_actual' => $cicloActual
        ]);
    }
}
