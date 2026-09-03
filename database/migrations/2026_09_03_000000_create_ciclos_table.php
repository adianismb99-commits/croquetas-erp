<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ciclos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo')->unique();
            $table->integer('numero');
            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_cierre')->nullable();
            $table->decimal('inversion_total', 12, 2)->default(0);
            $table->decimal('ingresos_totales', 12, 2)->default(0);
            $table->decimal('ganancia_bruta', 12, 2)->default(0);
            $table->decimal('gastos_operativos', 12, 2)->default(0);
            $table->decimal('ganancia_neta', 12, 2)->default(0);
            $table->decimal('porcentaje_rentabilidad', 8, 2)->default(0);
            $table->enum('estado', ['abierto', 'cerrado'])->default('abierto');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ciclos');
    }
};
