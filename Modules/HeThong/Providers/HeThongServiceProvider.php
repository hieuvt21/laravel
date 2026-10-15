<?php

namespace Modules\HeThong\Providers;

use Illuminate\Support\ServiceProvider;

class HeThongServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/he-thong.php', 'he-thong');
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../Routes/api.php');
    }
}
