<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProductoFinal extends Model
{
    use HasUuids;

    protected $table = 'productos_finales';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'precio_particular',
        'precio_restaurante',
        'precio_revendedor'
    ];

    public function recetas()
    {
        return $this->hasMany(Receta::class);
    }

    public function producciones()
    {
        return $this->hasMany(Produccion::class);
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    public function encargos()
    {
        return $this->hasMany(Encargo::class);
    }

    public function getStockAttribute()
    {
        $producido = $this->producciones()->sum('cantidad');
        $vendido = $this->ventas()->sum('cantidad');
        $encargado = $this->encargos()->where('estado', 'pendiente')->sum('cantidad');
        
        return $producido - $vendido - $encargado;
    }
}