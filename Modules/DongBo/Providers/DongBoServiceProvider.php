<?php

namespace Modules\DongBo\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\DongBo\Services\DongBoService;

class DongBoServiceProvider extends ServiceProvider
{
    public const TAG = 'dong-bo.thuc-the';

    public function register(): void
    {
        // Mỗi module đăng ký loại dữ liệu của mình: $this->app->tag([MyThucThe::class], 'dong-bo.thuc-the')
        $this->app->bind(DongBoService::class, fn ($app) => new DongBoService($app->tagged(self::TAG)));
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
    }
}
