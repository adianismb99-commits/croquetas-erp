<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        // Verificar si ya existe un admin para no duplicar
        if (!User::where('email', 'admin@antillas.com')->exists()) {
            User::create([
                'name' => 'Admin',
                'last_name' => 'APL',
                'email' => 'admin@antillas.com',
                'email_verified_at' => now(), 
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'is_active' => true,
            ]);
            $this->command->info('Usuario admin creado correctamente.');
        } else {
            $this->command->info('El usuario admin ya existe.');
        }
    }
}