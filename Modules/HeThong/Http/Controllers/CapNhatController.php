<?php

namespace Modules\HeThong\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Artisan;

/**
 * Để GitHub Actions gọi sau khi upload mã nguồn, cập nhật cấu trúc database mà không cần SSH.
 * Chỉ chạy khi header X-Deploy-Token khớp DEPLOY_TOKEN trong .env; sai hoặc chưa cấu hình thì trả 404.
 */
class CapNhatController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $token = (string) config('he-thong.deploy_token');
        if (strlen($token) < 32 || !hash_equals($token, (string) $request->header('X-Deploy-Token'))) {
            abort(404);
        }
        Artisan::call('migrate', ['--force' => true]);
        $kq = trim(Artisan::output());
        Artisan::call('optimize:clear');
        return response()->json(['ok' => true, 'migrate' => $kq]);
    }
}
