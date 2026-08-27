<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stadium extends Model
{
    use HasFactory;

    // Los campos que se pueden llenar masivamente (mass assignment)
    protected $fillable = [
        'name',
        'capacity',
        'location',
        'image_path'
    ];

    // Los campos que NO se deben mostrar en JSON
    protected $hidden = [
        'created_at',
        'updated_at'
    ];
}