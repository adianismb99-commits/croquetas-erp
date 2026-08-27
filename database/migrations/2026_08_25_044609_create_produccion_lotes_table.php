<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produccion_lotes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('produccion_id')->constrained('producciones')->onDelete('cascade');
            $table->foreignUuid('lote_insumo_id')->constrained('lotes_insumos')->onDelete('cascade');
            $table->decimal('cantidad_usada', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produccion_lotes');
    }
};