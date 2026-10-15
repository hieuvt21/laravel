<?php

use Illuminate\Support\Facades\Route;
use Modules\DongBo\Http\Controllers\DongBoController;
use Modules\XacThuc\Http\Middleware\XacThucToken;

Route::prefix('api/dong-bo')->middleware(['api', XacThucToken::class, 'throttle:240,1'])->group(function () {
    Route::post('day', [DongBoController::class, 'day']);
    Route::get('keo', [DongBoController::class, 'keo']);
});
