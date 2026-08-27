<?php
// PRUEBA - Esto debe aparecer en los logs
error_log('routes/api.php se está cargando correctamente');
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InsumoController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\Api\LoteInsumoController;
use App\Http\Controllers\Api\ProductoFinalController;
use App\Http\Controllers\Api\RecetaController;
use App\Http\Controllers\Api\ProduccionController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\VentaController;
use App\Http\Controllers\Api\EncargoController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\MovimientoController;
use App\Http\Controllers\Api\ContabilidadController;
use App\Http\Controllers\Api\CompraController;
use App\Http\Controllers\Api\AlmacenController;
use App\Http\Controllers\Api\NotificacionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Insumos
Route::apiResource('insumos', InsumoController::class);

// Proveedores
Route::apiResource('proveedores', ProveedorController::class);

// Lotes de insumos (Almacén)
Route::apiResource('lotes', LoteInsumoController::class);
Route::get('lotes-disponibles', [LoteInsumoController::class, 'disponibles']);

// Productos finales (croquetas)
Route::apiResource('productos', ProductoFinalController::class);
Route::get('productos/stock', [ProductoFinalController::class, 'stock']);

// Recetas (fórmula)
Route::apiResource('recetas', RecetaController::class);
Route::get('recetas/producto/{productoId}', [RecetaController::class, 'byProducto']);

// Producciones
Route::apiResource('producciones', ProduccionController::class);
Route::get('producciones/hoy', [ProduccionController::class, 'hoy']);

// Clientes
Route::apiResource('clientes', ClienteController::class);
Route::get('clientes/buscar/{telefono}', [ClienteController::class, 'buscarPorTelefono']);

// Ventas
Route::apiResource('ventas', VentaController::class);
Route::get('ventas/hoy', [VentaController::class, 'hoy']);
Route::post('ventas/resumen', [VentaController::class, 'resumen']);

// Encargos
Route::apiResource('encargos', EncargoController::class);
Route::put('encargos/{id}/entregar', [EncargoController::class, 'entregar']);
Route::get('encargos/proximos', [EncargoController::class, 'proximos']);

// Reportes
Route::prefix('reportes')->group(function () {
    Route::get('dashboard', [ReporteController::class, 'dashboard']);
    Route::post('contabilidad', [ReporteController::class, 'contabilidad']);
    Route::post('ventas', [ReporteController::class, 'ventas']);
    Route::post('ganancias', [ReporteController::class, 'ganancias']);
    Route::get('top-clientes', [ReporteController::class, 'topClientes']);
});
// Movimientos (Historial de Almacén)
Route::prefix('movimientos')->group(function () {
    Route::get('/', [MovimientoController::class, 'index']);
    Route::get('/resumen', [MovimientoController::class, 'resumen']);
    Route::get('/resumen-productos', [MovimientoController::class, 'resumenPorProducto']);
});
// Contabilidad
Route::prefix('contabilidad')->group(function () {
    Route::post('/', [ContabilidadController::class, 'index']);
    Route::post('/exportar', [ContabilidadController::class, 'exportar']);
});
// Compras
Route::prefix('compras')->group(function () {
    Route::post('/', [CompraController::class, 'index']);
    Route::post('/store', [CompraController::class, 'store']);
    Route::get('/resumen', [CompraController::class, 'resumen']);
});
// Almacén
Route::prefix('almacen')->group(function () {
    Route::get('/productos-terminados', [AlmacenController::class, 'productosTerminados']);
});
// Notificaciones
Route::prefix('notificaciones')->group(function () {
    Route::get('/', [NotificacionController::class, 'index']);
    Route::get('/contar', [NotificacionController::class, 'contar']);
});
//Notificaciones Push
Route::post('/notificaciones/subscribe', [NotificacionController::class, 'subscribe']);
Route::post('/notificaciones/unsubscribe', [NotificacionController::class, 'unsubscribe']);
Route::post('/notificaciones/send-test', [NotificacionController::class, 'sendTest']);

Route::get('/prueba-lotes', function() {
    $lotes = App\Models\LoteInsumo::with(['insumo', 'proveedor'])
        ->where('stock_restante', '>', 0)
        ->get();
    return response()->json($lotes);
});