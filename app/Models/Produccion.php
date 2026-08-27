<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Produccion extends Model
{
    use HasUuids;

    protected $table = 'producciones';

    protected $fillable = [
        'codigo',
        'producto_final_id',
        'cantidad',
        'fecha_hora',
        'costo_teorico',
        'costo_real',
        'diferencia',
        'porcentaje_variacion'
    ];

    protected $casts = [
        'fecha_hora' => 'datetime'
    ];

    public function productoFinal()
    {
        return $this->belongsTo(ProductoFinal::class);
    }

    public function produccionLotes()
    {
        return $this->hasMany(ProduccionLote::class);
    }

    // Generar código automático
    public static function generarCodigo($productoId)
    {
        $producto = ProductoFinal::find($productoId);
        $prefijo = strtoupper(substr($producto->nombre, 0, 3));
        $fecha = now()->format('ymd');
        
        // Buscar el último código del día
        $ultimo = self::where('codigo', 'like', $prefijo . '-' . $fecha . '-%')
            ->orderBy('codigo', 'desc')
            ->first();
        
        if ($ultimo) {
            $numero = intval(substr($ultimo->codigo, -3)) + 1;
        } else {
            $numero = 1;
        }
        
        return $prefijo . '-' . $fecha . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    // Calcular costos teóricos y reales
    public function calcularCostos()
    {
        $totalTeorico = 0;
        $totalReal = 0;

        foreach ($this->produccionLotes as $pl) {
            $lote = $pl->loteInsumo;
            $receta = Receta::where('producto_final_id', $this->producto_final_id)
                ->where('insumo_id', $lote->insumo_id)
                ->first();

            // Costo real
            $costoReal = $pl->cantidad_usada * ($lote->precio_total / $lote->cantidad);
            $totalReal += $costoReal;

            // Costo teórico (si existe receta)
            if ($receta) {
                $cantidadTeorica = ($receta->cantidad_teorica / $receta->unidades_base) * $this->cantidad;
                $costoTeorico = $cantidadTeorica * ($lote->precio_total / $lote->cantidad);
                $totalTeorico += $costoTeorico;
            }
        }

        $this->costo_teorico = $totalTeorico;
        $this->costo_real = $totalReal;
        $this->diferencia = $totalReal - $totalTeorico;
        
        if ($totalTeorico > 0) {
            $this->porcentaje_variacion = (($totalReal - $totalTeorico) / $totalTeorico) * 100;
        } else {
            $this->porcentaje_variacion = 0;
        }

        $this->save();
    }
}