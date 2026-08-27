<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Venta extends Model
{
    use HasUuids;

    protected $fillable = [
        'movimiento_id',
        'cliente_id',
        'producto_final_id',
        'cantidad',
        'precio_unitario',
        'total',
        'metodo_pago',
        'fecha_hora'
    ];

    protected $casts = [
        'fecha_hora' => 'datetime'
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function productoFinal()
    {
        return $this->belongsTo(ProductoFinal::class);
    }

    public function movimiento()
    {
        return $this->hasOne(Movimiento::class, 'producto_id', 'producto_final_id')
            ->where('tipo', 'venta');
    }
}