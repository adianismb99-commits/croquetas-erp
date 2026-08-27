<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lotes_insumos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('insumo_id')->constrained('insumos')->onDelete('cascade');
            $table->foreignUuid('proveedor_id')->constrained('proveedores')->onDelete('cascade');
            $table->decimal('cantidad', 10, 2);
            $table->decimal('precio_total', 10, 2);
            $table->date('fecha_compra');
            $table->decimal('stock_restante', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lotes_insumos');
    }
};