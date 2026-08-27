<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producciones', function (Blueprint $table) {
            $table->string('codigo')->unique()->after('id')->nullable();
            $table->decimal('costo_teorico', 10, 2)->default(0)->after('cantidad');
            $table->decimal('costo_real', 10, 2)->default(0)->after('costo_teorico');
            $table->decimal('diferencia', 10, 2)->default(0)->after('costo_real');
            $table->decimal('porcentaje_variacion', 8, 2)->default(0)->after('diferencia');
        });
    }

    public function down(): void
    {
        Schema::table('producciones', function (Blueprint $table) {
            $table->dropColumn(['codigo', 'costo_teorico', 'costo_real', 'diferencia', 'porcentaje_variacion']);
        });
    }
};