<?php

use App\Http\Controllers\Admin\AdminHolidayController;
use App\Http\Controllers\Admin\AdminPriceController;
use App\Http\Controllers\Admin\AdminRegularHolidayController;
use App\Http\Controllers\Admin\AdminReservationController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 公開エンドポイント
Route::get('/calendar', [CalendarController::class, 'index']);
Route::get('/prices', [FacilityController::class, 'prices']);
Route::get('/regular-holidays', [FacilityController::class, 'regularHolidays']);

// 認証
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [SessionController::class, 'store']);

// 認証済みユーザー
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [SessionController::class, 'destroy']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/my-reservations', [ReservationController::class, 'index']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);
});

// 管理者
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/reservations', [AdminReservationController::class, 'index']);
    Route::post('/reservations', [AdminReservationController::class, 'store']);
    Route::delete('/reservations/{reservation}', [AdminReservationController::class, 'destroy']);

    Route::get('/prices', [AdminPriceController::class, 'index']);
    Route::put('/prices', [AdminPriceController::class, 'update']);

    Route::get('/holidays', [AdminHolidayController::class, 'index']);
    Route::post('/holidays', [AdminHolidayController::class, 'store']);
    Route::delete('/holidays/{holiday}', [AdminHolidayController::class, 'destroy']);

    Route::get('/regular-holidays', [AdminRegularHolidayController::class, 'index']);
    Route::put('/regular-holidays', [AdminRegularHolidayController::class, 'update']);

    Route::get('/users', [AdminUserController::class, 'index']);
});
