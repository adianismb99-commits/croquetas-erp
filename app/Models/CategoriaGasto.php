<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CategoriaGasto extends Model
{
    use HasUuids;

    protected $table = 'categorias_gastos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'color'
    ];

    public function gastos()
    {
        return $this->hasMany(GastoOperativo::class);
    }
}
