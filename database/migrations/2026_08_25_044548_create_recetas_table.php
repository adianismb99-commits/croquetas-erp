<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recetas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('producto_final_id')->constrained('productos_finales')->onDelete('cascade');
            $table->foreignUuid('insumo_id')->constrained('insumos')->onDelete('cascade');
            $table->decimal('cantidad_teorica', 10, 2);
            $table->integer('unidades_base');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recetas');
    }
};