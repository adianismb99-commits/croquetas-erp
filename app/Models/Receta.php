<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Receta extends Model
{
    use HasUuids;

    protected $table = 'recetas';

    protected $fillable = [
        'codigo',
        'producto_final_id',
        'insumo_id',
        'cantidad_teorica',
        'unidades_base'
    ];

    public function productoFinal()
    {
        return $this->belongsTo(ProductoFinal::class);
    }

    public function insumo()
    {
        return $this->belongsTo(Insumo::class);
    }
}
