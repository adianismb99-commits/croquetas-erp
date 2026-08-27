<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produccion_lotes', function (Blueprint $table) {
            $table->decimal('costo_unitario', 10, 2)->default(0)->after('cantidad_usada');
            $table->decimal('costo_total', 10, 2)->default(0)->after('costo_unitario');
        });
    }

    public function down(): void
    {
        Schema::table('produccion_lotes', function (Blueprint $table) {
            $table->dropColumn(['costo_unitario', 'costo_total']);
        });
    }
};