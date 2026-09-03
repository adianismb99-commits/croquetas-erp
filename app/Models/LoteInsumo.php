<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Movimiento;

class LoteInsumo extends Model
{
    use HasUuids;

    protected $table = 'lotes_insumos';

    protected $fillable = [
        'codigo',
        'insumo_id',
        'proveedor_id',
        'cantidad',
        'precio_total',
        'costo_unitario',
        'fecha_compra',
        'stock_restante'
    ];

    protected $casts = [
        'fecha_compra' => 'date'
    ];

    public function insumo()
    {
        return $this->belongsTo(Insumo::class);
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function produccionLotes()
    {
        return $this->hasMany(ProduccionLote::class);
    }

    public function getPrecioUnitarioAttribute()
    {
        return $this->stock_restante > 0 
            ? $this->precio_total / $this->stock_restante 
            : 0;
    }

    public function getCostoUnitarioAttribute()
    {
        return $this->cantidad > 0 
            ? $this->precio_total / $this->cantidad 
            : 0;
    }

    public function registrarMovimiento($tipo, $cantidadUsada = null, $detalle = null)
    {
        $cantidad = $cantidadUsada ?? $this->cantidad;
        $entrada = ($tipo === 'compra' || $tipo === 'produccion') ? $cantidad : 0;
        $salida = ($tipo === 'uso_insumo' || $tipo === 'venta') ? $cantidad : 0;
        
        $ultimoMovimiento = Movimiento::where('producto_id', $this->insumo_id)
            ->where('producto_tipo', 'insumo')
            ->orderBy('fecha', 'desc')
            ->first();
        
        $saldo = $ultimoMovimiento ? $ultimoMovimiento->saldo : 0;
        $saldo += $entrada - $salida;

        Movimiento::create([
            'codigo' => $this->codigo,
            'tipo' => $tipo,
            'producto_id' => $this->insumo_id,
            'producto_tipo' => 'insumo',
            'producto_nombre' => $this->insumo->nombre,
            'unidad' => $this->insumo->unidad,
            'cantidad' => $cantidad,
            'entrada' => $entrada,
            'salida' => $salida,
            'saldo' => $saldo,
            'detalle' => $detalle,
            'costo_total' => $this->precio_total,
            'fecha' => now()
        ]);
    }
    public function ciclo()
    {
        return $this->belongsTo(Ciclo::class);
    }
}
