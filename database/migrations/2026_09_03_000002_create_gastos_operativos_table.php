<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos_operativos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ciclo_id')->nullable()->constrained('ciclos')->onDelete('set null');
            $table->foreignUuid('categoria_id')->nullable()->constrained('categorias_gastos')->onDelete('set null');
            $table->string('concepto');
            $table->text('descripcion')->nullable();
            $table->decimal('monto', 10, 2);
            $table->date('fecha');
            $table->enum('tipo', ['gasto', 'inversion_extra'])->default('gasto');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos_operativos');
    }
};
