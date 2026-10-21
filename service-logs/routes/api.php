<?php

use App\Http\Controllers\Api\LogController;
use Illuminate\Support\Facades\Route;

Route::middleware('jwt.auth')->group(function () {
    Route::post('/logs', [LogController::class, 'store']);
    Route::get('/logs', [LogController::class, 'index']);
});
