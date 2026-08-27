<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo')->nullable(); // HAR-001, CPO-250826-001
            $table->enum('tipo', ['compra', 'produccion', 'uso_insumo', 'venta', 'encargo_reserva', 'encargo_entregado']);
            $table->uuid('producto_id')->nullable(); // insumo_id o producto_final_id
            $table->string('producto_tipo'); // 'insumo' o 'producto_final'
            $table->string('producto_nombre');
            $table->string('unidad');
            $table->decimal('cantidad', 10, 2);
            $table->decimal('entrada', 10, 2)->default(0);
            $table->decimal('salida', 10, 2)->default(0);
            $table->decimal('saldo', 10, 2)->default(0);
            $table->text('detalle')->nullable();
            $table->decimal('costo_total', 10, 2)->default(0);
            $table->timestamp('fecha');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};