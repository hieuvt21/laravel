<?php

namespace Modules\GiaoDien\Providers;

use Illuminate\Support\ServiceProvider;

class GiaoDienServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../Resources/views', 'giao-dien');
        $this->loadRoutesFrom(__DIR__ . '/../Routes/web.php');
    }
}
