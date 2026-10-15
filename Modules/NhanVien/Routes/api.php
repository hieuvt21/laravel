<?php

use Illuminate\Support\Facades\Route;
use Modules\NhanVien\Http\Controllers\TaiKhoanNhanVienController;
use Modules\XacThuc\Http\Middleware\XacThucToken;

Route::prefix('api/nhan-vien')->middleware(['api', XacThucToken::class, 'throttle:30,1'])->group(function () {
    Route::put('{id}/tai-khoan', [TaiKhoanNhanVienController::class, 'luu'])->where('id', '[A-Za-z0-9-]{1,36}');
    Route::delete('{id}/tai-khoan', [TaiKhoanNhanVienController::class, 'go'])->where('id', '[A-Za-z0-9-]{1,36}');
});
