<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Movimiento extends Model
{
    use HasUuids;

    protected $table = 'movimientos';

    protected $fillable = [
        'codigo',
        'tipo',
        'producto_id',
        'producto_tipo',
        'producto_nombre',
        'unidad',
        'cantidad',
        'entrada',
        'salida',
        'saldo',
        'detalle',
        'costo_total',
        'fecha'
    ];

    protected $casts = [
        'fecha' => 'datetime'
    ];
}