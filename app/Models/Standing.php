<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Standing extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'season_id',
        'points',
        'wins',
        'draws',
        'losses',
        'goals_for',
        'goals_against',
        'matches_played'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    // Relación con equipo
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    // Relación con temporada
    public function season()
    {
        return $this->belongsTo(Season::class);
    }

    // Método para calcular el goal difference automáticamente
    public function getGoalDifferenceAttribute()
    {
        return $this->goals_for - $this->goals_against;
    }
}