<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class NotificacionContable extends Model
{
    use HasUuids;

    protected $table = 'notificaciones_contables';

    protected $fillable = [
        'titulo',
        'mensaje',
        'tipo',
        'ciclo_id',
        'leida'
    ];

    protected $casts = [
        'leida' => 'boolean'
    ];

    public function ciclo()
    {
        return $this->belongsTo(Ciclo::class);
    }
}
