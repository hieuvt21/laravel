<?php

namespace Modules\NhanVien\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\DongBo\Providers\DongBoServiceProvider;
use Modules\NhanVien\DongBo\ChucVuThucThe;
use Modules\NhanVien\DongBo\NhanVienThucThe;

class NhanVienServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->tag([NhanVienThucThe::class, ChucVuThucThe::class], DongBoServiceProvider::TAG);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
    }
}
