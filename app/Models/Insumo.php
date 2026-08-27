<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Insumo extends Model
{
    use HasUuids;

    protected $fillable = [
        'codigo',
        'nombre',
        'unidad',
        'descripcion'
    ];

    public function lotes()
    {
        return $this->hasMany(LoteInsumo::class);
    }

    public function recetas()
    {
        return $this->hasMany(Receta::class);
    }
}