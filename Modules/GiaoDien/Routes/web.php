<?php

use Illuminate\Support\Facades\Route;

// Mọi đường dẫn (trừ api, build, storage) đều trả về trang SPA, Vue Router sẽ xử lý tiếp.
Route::view('/{any?}', 'giao-dien::app')
    ->where('any', '^(?!api|build|storage|sanctum).*$')
    ->name('spa');
