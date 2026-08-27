<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'city',
        'founded_year',
        'primary_color',
        'secondary_color',
        'logo_path',
        'history',
        'is_active'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relación con estadio
    public function stadium()
    {
        return $this->belongsTo(Stadium::class);
    }

    // Relación con jugadores actuales (con temporada)
    public function currentPlayers()
    {
        return $this->belongsToMany(Player::class, 'team_player')
                    ->withPivot('dorsal', 'is_captain', 'season_id')
                    ->wherePivot('is_current', true);
    }

    // Relación con todos los jugadores históricos
    public function historicalPlayers()
    {
        return $this->belongsToMany(Player::class, 'team_player')
                    ->withPivot('dorsal', 'start_date', 'end_date', 'is_captain', 'season_id');
    }

    // 👇 AGREGAR ESTA RELACIÓN 👇
    // Relación directa con jugadores (para el frontend)
    public function players()
    {
        return $this->hasMany(Player::class);
    }

    // Relación con partidos como local
    public function homeGames()
    {
        return $this->hasMany(Game::class, 'home_team_id');
    }

    // Relación con partidos como visitante
    public function awayGames()
    {
        return $this->hasMany(Game::class, 'away_team_id');
    }
}