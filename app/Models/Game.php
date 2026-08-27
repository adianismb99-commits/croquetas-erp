<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Game extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'season_id',
        'home_team_id',
        'away_team_id',
        'stadium_id',
        'scheduled_date',
        'scheduled_time',
        'status',
        'home_score',
        'away_score'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relación con temporada
    public function season()
    {
        return $this->belongsTo(Season::class);
    }

    // Relación con equipo local
    public function homeTeam()
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    // Relación con equipo visitante
    public function awayTeam()
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    // Relación con estadio
    public function stadium()
    {
        return $this->belongsTo(Stadium::class);
    }

    // 👇 AGREGAR ESTA RELACIÓN 👇
    // Relación con eventos del partido
    public function matchEvents()
    {
        return $this->hasMany(MatchEvent::class);
    }
}