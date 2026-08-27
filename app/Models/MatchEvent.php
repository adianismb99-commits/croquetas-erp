<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'team_id',
        'player_id',
        'assist_player_id',
        'type',
        'minute',
        'extra_time_minute',
        'description'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    // Relación con el partido
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    // Relación con el equipo
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    // Relación con el jugador
    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    // Relación con el jugador que asiste
    public function assistPlayer()
    {
        return $this->belongsTo(Player::class, 'assist_player_id');
    }
}