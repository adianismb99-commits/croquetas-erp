<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProduccionLote extends Model
{
    use HasUuids;

    protected $table = 'produccion_lotes';

    protected $fillable = [
        'produccion_id',
        'lote_insumo_id',
        'cantidad_usada',
        'costo_unitario',
        'costo_total'
    ];

    public function produccion()
    {
        return $this->belongsTo(Produccion::class);
    }

    public function loteInsumo()
    {
        return $this->belongsTo(LoteInsumo::class);
    }
}