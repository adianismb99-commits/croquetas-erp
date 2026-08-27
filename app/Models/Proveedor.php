<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Proveedor extends Model
{
    use HasUuids;

    protected $table = 'proveedores';  // <--- AÑADIR ESTA LÍNEA

    protected $fillable = [
        'nombre',
        'telefono',
        'direccion'
    ];
}