<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/insumos', function () {
        return Inertia::render('Insumos/Index');
    })->name('insumos.index');
    
    Route::get('/proveedores', function () {
        return Inertia::render('Proveedores/Index');
    })->name('proveedores.index');
    
    Route::get('/almacen', function () {  // <--- RUTA CORRECTA PARA ALMACÉN
        return Inertia::render('Lotes/Index');
    })->name('almacen.index');
    
    // También mantener /lotes para compatibilidad
    Route::get('/lotes', function () {
        return Inertia::render('Lotes/Index');
    })->name('lotes.index');
    
    Route::get('/productos', function () {
        return Inertia::render('Productos/Index');
    })->name('productos.index');
    
    Route::get('/recetas', function () {
        return Inertia::render('Recetas/Index');
    })->name('recetas.index');
    
    Route::get('/produccion', function () {
        return Inertia::render('Produccion/Index');
    })->name('produccion.index');
    
    Route::get('/clientes', function () {
        return Inertia::render('Clientes/Index');
    })->name('clientes.index');
    
    Route::get('/ventas', function () {
        return Inertia::render('Ventas/Index');
    })->name('ventas.index');
    
    Route::get('/encargos', function () {
        return Inertia::render('Encargos/Index');
    })->name('encargos.index');
    
    Route::get('/reportes', function () {
        return Inertia::render('Reportes/Index');
    })->name('reportes.index');
    Route::get('/movimientos', function () {
        return Inertia::render('Almacen/Movimientos');
    })->name('movimientos.index');
    Route::get('/contabilidad', function () {
        return Inertia::render('Contabilidad/Index');
    })->name('contabilidad.index');
    Route::get('/compras', function () {
        return Inertia::render('Compras/Index');
    })->name('compras.index');
    Route::get('/almacen/productos-terminados', function () {
        return Inertia::render('Almacen/ProductosTerminados');
    })->name('almacen.productos-terminados');
});


require __DIR__.'/auth.php';