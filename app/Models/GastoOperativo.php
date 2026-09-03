<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GastoOperativo extends Model
{
    use HasUuids;

    protected $table = 'gastos_operativos';

    protected $fillable = [
        'ciclo_id',
        'categoria_id',
        'concepto',
        'descripcion',
        'monto',
        'fecha',
        'tipo'
    ];

    protected $casts = [
        'fecha' => 'date'
    ];

    public function ciclo()
    {
        return $this->belongsTo(Ciclo::class);
    }

    public function categoria()
    {
        return $this->belongsTo(CategoriaGasto::class, 'categoria_id');
    }
}
