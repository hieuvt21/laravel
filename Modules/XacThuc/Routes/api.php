<?php

use Illuminate\Support\Facades\Route;
use Modules\XacThuc\Http\Controllers\DangNhapController;
use Modules\XacThuc\Http\Middleware\XacThucToken;

Route::prefix('api')->middleware('api')->group(function () {
    Route::post('dang-nhap', [DangNhapController::class, 'dangNhap'])->middleware('throttle:30,1');

    Route::middleware(XacThucToken::class)->group(function () {
        Route::post('dang-xuat', [DangNhapController::class, 'dangXuat']);
        Route::get('toi', [DangNhapController::class, 'toi']);
        Route::post('doi-mat-khau', [DangNhapController::class, 'doiMatKhau'])->middleware('throttle:10,1');
    });
});
