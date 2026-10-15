<?php

namespace Modules\XacThuc\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\XacThuc\Models\PhienDangNhap;
use Modules\XacThuc\Models\TaiKhoan;
use Modules\XacThuc\Services\Quyen;

/** Yêu cầu header "Authorization: Bearer <token>". Gắn taiKhoan, phien, quyen vào request. */
class XacThucToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        $phien = $token
            ? PhienDangNhap::where('ma_hash', hash('sha256', $token))->where('het_han', '>', now())->first()
            : null;
        $tk = $phien ? TaiKhoan::find($phien->tai_khoan_id) : null;
        $quyen = $tk ? new Quyen($tk) : null;

        if (!$tk || $tk->khoa || !$quyen->hopLe()) {
            return response()->json(['loi' => 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'], 401);
        }

        // Gia hạn phiên khi còn dùng (tối đa mỗi giờ ghi một lần)
        if (!$phien->dung_lan_cuoi || $phien->dung_lan_cuoi->lt(now()->subHour())) {
            $phien->forceFill(['dung_lan_cuoi' => now(), 'het_han' => now()->addDays(60)])->save();
        }

        $request->attributes->set('taiKhoan', $tk);
        $request->attributes->set('phien', $phien);
        $request->attributes->set('quyen', $quyen);
        return $next($request);
    }
}
