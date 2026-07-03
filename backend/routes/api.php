<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\CalendarController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 公開エンドポイント
Route::get('/calendar', [CalendarController::class, 'index']);

// 認証
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [SessionController::class, 'store']);

// 認証済みユーザー
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/logout', [SessionController::class, 'destroy']);
});
