<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'first_name',
        'last_name',
        'role',
        'start_date',
        'end_date',
        'photo_path',
        'biography',
        'is_active'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relación con equipo
    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}