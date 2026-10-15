<?php

return [
    // Đặt DEPLOY_TOKEN trong .env trên host (chuỗi ngẫu nhiên >= 32 ký tự). Để trống = tắt chức năng cập nhật tự động.
    'deploy_token' => env('DEPLOY_TOKEN', ''),
];
