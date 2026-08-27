<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Encargo extends Model
{
    use HasUuids;

    protected $fillable = [
        'cliente_id',
        'producto_final_id',
        'cantidad',
        'precio_acordado',
        'fecha_entrega',
        'estado'
    ];

    protected $casts = [
        'fecha_entrega' => 'datetime'
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function productoFinal()
    {
        return $this->belongsTo(ProductoFinal::class);
    }
}