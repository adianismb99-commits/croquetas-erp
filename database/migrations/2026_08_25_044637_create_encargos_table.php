<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encargos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignUuid('producto_final_id')->constrained('productos_finales')->onDelete('cascade');
            $table->integer('cantidad');
            $table->decimal('precio_acordado', 10, 2);
            $table->timestamp('fecha_entrega');
            $table->enum('estado', ['pendiente', 'listo', 'entregado'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encargos');
    }
};