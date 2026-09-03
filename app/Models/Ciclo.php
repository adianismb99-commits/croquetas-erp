<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Ciclo extends Model
{
    use HasUuids;

    protected $fillable = [
        'codigo',
        'numero',
        'fecha_inicio',
        'fecha_cierre',
        'inversion_total',
        'ingresos_totales',
        'ganancia_bruta',
        'gastos_operativos',
        'ganancia_neta',
        'porcentaje_rentabilidad',
        'estado'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_cierre' => 'datetime',
    ];

    public function lotes()
    {
        return $this->hasMany(LoteInsumo::class);
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    public function gastos()
    {
        return $this->hasMany(GastoOperativo::class);
    }

    public function notificaciones()
    {
        return $this->hasMany(NotificacionContable::class);
    }

    // Generar código del ciclo (260903-001)
    public static function generarCodigo()
    {
        $fecha = now()->format('ymd');
        $ultimo = self::where('codigo', 'like', $fecha . '-%')
            ->orderBy('codigo', 'desc')
            ->first();

        if ($ultimo) {
            $numero = intval(substr($ultimo->codigo, -3)) + 1;
        } else {
            $numero = 1;
        }

        return $fecha . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    // Obtener el ciclo abierto actual
    public static function getCicloActual()
    {
        return self::where('estado', 'abierto')->first();
    }

    // Calcular ganancias del ciclo
    public function calcularGanancias()
    {
        $this->inversion_total = $this->lotes()->where('es_inversion', true)->sum('precio_total');
        $this->ingresos_totales = $this->ventas()->sum('total');
        $this->ganancia_bruta = $this->ingresos_totales - $this->inversion_total;
        $this->gastos_operativos = $this->gastos()->sum('monto');
        $this->ganancia_neta = $this->ganancia_bruta - $this->gastos_operativos;

        if ($this->ingresos_totales > 0) {
            $this->porcentaje_rentabilidad = ($this->ganancia_neta / $this->ingresos_totales) * 100;
        } else {
            $this->porcentaje_rentabilidad = 0;
        }

        $this->save();
    }

    // Cerrar ciclo
    public function cerrar()
    {
        $this->calcularGanancias();
        $this->estado = 'cerrado';
        $this->fecha_cierre = now();
        $this->save();

        // Crear notificación
        NotificacionContable::create([
            'titulo' => '🔒 Ciclo cerrado',
            'mensaje' => "El ciclo {$this->codigo} se ha cerrado con una ganancia neta de \${$this->ganancia_neta}",
            'tipo' => 'ciclo_cerrado',
            'ciclo_id' => $this->id
        ]);

        return $this;
    }

    // Aumentar inversión (crea un nuevo ciclo)
    public static function aumentarInversion($monto, $descripcion = null)
    {
        $cicloActual = self::getCicloActual();

        if (!$cicloActual) {
            return null;
        }

        // Crear un gasto operativo de tipo inversion_extra
        $gasto = GastoOperativo::create([
            'ciclo_id' => $cicloActual->id,
            'concepto' => 'Aumento de inversión',
            'descripcion' => $descripcion ?? 'Inversión extra agregada manualmente',
            'monto' => $monto,
            'fecha' => now()->toDateString(),
            'categoria_id' => null,
            'tipo' => 'inversion_extra'
        ]);

        // Crear un nuevo ciclo con la inversión aumentada
        $codigo = self::generarCodigo();
        $numero = self::where('codigo', 'like', now()->format('ymd') . '-%')->count() + 1;

        $nuevoCiclo = self::create([
            'codigo' => $codigo,
            'numero' => $numero,
            'fecha_inicio' => now(),
            'inversion_total' => $cicloActual->inversion_total + $monto,
            'estado' => 'abierto'
        ]);

        return $nuevoCiclo;
    }
}
