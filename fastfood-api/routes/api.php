<?php

use Illuminate\Support\Facades\Route;

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);

// ---------------------------------------------------------------------------
// Authenticated endpoints (Sanctum token)
// ---------------------------------------------------------------------------

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [App\Http\Controllers\AuthController::class, 'me']);
    Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);

    // Menus: read for any authenticated user; writes only for admins.
    Route::get('/menus', [App\Http\Controllers\MenuController::class, 'index']);
    Route::get('/menus/{menu}', [App\Http\Controllers\MenuController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/menus', [App\Http\Controllers\MenuController::class, 'store']);
        Route::put('/menus/{menu}', [App\Http\Controllers\MenuController::class, 'update']);
        Route::delete('/menus/{menu}', [App\Http\Controllers\MenuController::class, 'destroy']);
    });

    // Orders
    Route::get('/orders', [App\Http\Controllers\OrderController::class, 'index']);
    Route::post('/orders', [App\Http\Controllers\OrderController::class, 'store']);
    Route::get('/orders/{order}', [App\Http\Controllers\OrderController::class, 'show']);
    Route::put('/orders/{order}', [App\Http\Controllers\OrderController::class, 'update']);

    // Kitchen
    Route::get('/kitchen/orders', [App\Http\Controllers\KitchenController::class, 'index']);
    Route::put('/kitchen/orders/{order}/status', [App\Http\Controllers\KitchenController::class, 'updateStatus']);

    // Dashboard + reports (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index']);
        Route::get('/reports/sales', [App\Http\Controllers\ReportController::class, 'sales']);

        // Users (minimal management)
        Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
        Route::post('/users', [App\Http\Controllers\UserController::class, 'store']);
        Route::put('/users/{user}', [App\Http\Controllers\UserController::class, 'update']);
        Route::delete('/users/{user}', [App\Http\Controllers\UserController::class, 'destroy']);
    });
});