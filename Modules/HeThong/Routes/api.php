<?php

use Illuminate\Support\Facades\Route;
use Modules\HeThong\Http\Controllers\CapNhatController;

Route::post('api/he-thong/cap-nhat', CapNhatController::class)->middleware(['api', 'throttle:6,1']);
