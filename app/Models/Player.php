<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Player extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'first_name',
        'last_name',
        'dorsal',
        'position',
        'date_of_birth',
        'nationality',
        'height',
        'weight',
        'photo_path',
        'biography',
        'is_active'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relación con equipo (actual, si tiene)
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    // Relación con todos los equipos (históricos)
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_player')
                    ->withPivot('dorsal', 'is_captain', 'season_id');
    }

    // Relación con estadísticas
    public function statistics()
    {
        return $this->hasMany(PlayerStatistic::class);
    }

    // Relación con eventos de partido (goles, tarjetas, etc.)
    public function matchEvents()
    {
        return $this->hasMany(MatchEvent::class);
    }
}