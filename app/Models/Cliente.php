<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Cliente extends Model
{
    use HasUuids;

    protected $fillable = [
        'nombre',
        'telefono',
        'direccion',
        'tipo'
    ];

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    public function encargos()
    {
        return $this->hasMany(Encargo::class);
    }
}