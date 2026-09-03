<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lotes_insumos', function (Blueprint $table) {
            $table->foreignUuid('ciclo_id')->nullable()->constrained('ciclos')->onDelete('set null');
            $table->boolean('es_inversion')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('lotes_insumos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('ciclo_id');
            $table->dropColumn('es_inversion');
        });
    }
};
