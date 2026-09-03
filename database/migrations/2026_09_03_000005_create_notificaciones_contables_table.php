<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones_contables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo');
            $table->text('mensaje');
            $table->string('tipo'); // ciclo_cerrado, stock_bajo, etc.
            $table->foreignUuid('ciclo_id')->nullable()->constrained('ciclos')->onDelete('cascade');
            $table->boolean('leida')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones_contables');
    }
};
