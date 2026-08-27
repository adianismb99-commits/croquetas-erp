<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrarDatos extends Command
{
    protected $signature = 'migrar:datos';
    protected $description = 'Migrar datos de SQLite a Supabase';

    public function handle()
    {
        $this->info('🔄 Iniciando migración de datos...');

        // Verificar que SQLite existe
        $sqlitePath = database_path('database.sqlite');
        if (!file_exists($sqlitePath)) {
            $this->error("❌ No se encuentra el archivo SQLite: $sqlitePath");
            return 1;
        }

        // Configurar conexión SQLite temporalmente
        config(['database.connections.sqlite' => [
            'driver' => 'sqlite',
            'database' => $sqlitePath,
            'prefix' => '',
        ]]);

        // Limpiar Supabase
        $this->info('🧹 Limpiando datos en Supabase...');
        $tables = ['insumos', 'proveedores', 'lotes_insumos', 'productos_finales', 'recetas', 'producciones', 'produccion_lotes', 'clientes', 'ventas', 'encargos', 'movimientos', 'users'];
        
        foreach ($tables as $table) {
            try {
                DB::connection('pgsql')->table($table)->delete();
                $this->line("  ✅ Tabla $table limpiada");
            } catch (\Exception $e) {
                $this->line("  ⚠️ Tabla $table: " . $e->getMessage());
            }
        }

        // Migrar datos
        $this->info("\n📦 Migrando datos...");
        
        foreach ($tables as $table) {
            try {
                $data = DB::connection('sqlite')->table($table)->get();
                $count = $data->count();
                
                if ($count > 0) {
                    $inserted = 0;
                    foreach ($data as $row) {
                        try {
                            $rowArray = (array) $row;
                            // Limpiar campos
                            unset($rowArray['laravel_through_key']);
                            DB::connection('pgsql')->table($table)->insert($rowArray);
                            $inserted++;
                        } catch (\Exception $e) {
                            // Intentar sin id
                            try {
                                $rowArray = (array) $row;
                                unset($rowArray['id']);
                                unset($rowArray['laravel_through_key']);
                                DB::connection('pgsql')->table($table)->insert($rowArray);
                                $inserted++;
                            } catch (\Exception $e2) {
                                // Si falla, mostrar error
                            }
                        }
                    }
                    $this->line("  ✅ $table: $inserted de $count registros migrados");
                } else {
                    $this->line("  ℹ️ $table: vacía");
                }
            } catch (\Exception $e) {
                $this->line("  ❌ $table: " . $e->getMessage());
            }
        }

        // Verificar
        $this->info("\n📊 Verificando datos migrados:");
        foreach ($tables as $table) {
            try {
                $count = DB::connection('pgsql')->table($table)->count();
                $this->line("  ✅ $table: $count registros");
            } catch (\Exception $e) {
                $this->line("  ❌ $table: error");
            }
        }

        $this->info("\n🎉 Migración completada!");
        return 0;
    }
}