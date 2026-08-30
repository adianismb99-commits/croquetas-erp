<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

session_start();
echo "Session ID: " . session_id() . "\n";
echo "User ID: " . (auth()->id() ?? 'No autenticado') . "\n";

$response->send();
$kernel->terminate($request, $response);