<?php

namespace Modules\GiaoDien\Providers;

use Illuminate\Support\ServiceProvider;

class GiaoDienServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Tự đăng ký mọi provider của các module khác (Modules/*/Providers/*ServiceProvider.php),
        // thêm module mới không phải sửa bootstrap/providers.php.
        foreach (glob(base_path('Modules/*/Providers/*ServiceProvider.php')) ?: [] as $file) {
            $class = 'Modules\\' . basename(dirname($file, 2)) . '\\Providers\\' . basename($file, '.php');
            if ($class !== static::class && class_exists($class)) {
                $this->app->register($class);
            }
        }
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../Resources/views', 'giao-dien');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/web.php');
    }
}
