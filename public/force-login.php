<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

// 🔥 FORZAR LOGIN
$user = \App\Models\User::first();
if ($user) {
    auth()->login($user);
    echo "✅ Usuario {$user->email} autenticado forzadamente\n";
} else {
    echo "❌ No hay usuarios\n";
}

echo "User ID: " . (auth()->id() ?? 'No autenticado') . "\n";

$response->send();
$kernel->terminate($request, $response);