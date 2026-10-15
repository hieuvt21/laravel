<?php

namespace Modules\XacThuc\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Modules\XacThuc\Models\PhienDangNhap;
use Modules\XacThuc\Models\TaiKhoan;
use Modules\XacThuc\Services\Quyen;

class DangNhapController extends Controller
{
    public function dangNhap(Request $request): JsonResponse
    {
        $d = $request->validate([
            'tenDangNhap' => ['required', 'string', 'max:30'],
            'matKhau' => ['required', 'string', 'max:100'],
            'thietBi' => ['nullable', 'string', 'max:100'],
        ]);
        $ten = mb_strtolower(trim($d['tenDangNhap']));
        $khoa = 'dang-nhap|' . $ten . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($khoa, 5)) {
            return response()->json(['loi' => 'Nhập sai quá nhiều lần. Vui lòng thử lại sau ' . RateLimiter::availableIn($khoa) . ' giây.'], 429);
        }

        $tk = TaiKhoan::where('ten_dang_nhap', $ten)->first();
        if (!$tk || !Hash::check($d['matKhau'], $tk->mat_khau)) {
            RateLimiter::hit($khoa, 30);
            return response()->json(['loi' => 'Sai tên đăng nhập hoặc mật khẩu.'], 401);
        }
        if ($tk->khoa) {
            return response()->json(['loi' => 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'], 403);
        }
        $quyen = new Quyen($tk);
        if (!$quyen->hopLe()) {
            return response()->json(['loi' => 'Tài khoản này chưa được gắn với nhân viên hoặc khách hàng.'], 403);
        }
        RateLimiter::clear($khoa);

        $token = Str::random(64);
        PhienDangNhap::create([
            'tai_khoan_id' => $tk->id,
            'ma_hash' => hash('sha256', $token),
            'thiet_bi' => $d['thietBi'] ?? null,
            'dung_lan_cuoi' => now(),
            'het_han' => now()->addDays(60),
        ]);

        return response()->json(['token' => $token, 'nguoiDung' => $quyen->nguoiDung()]);
    }

    public function dangXuat(Request $request): JsonResponse
    {
        $request->attributes->get('phien')->delete();
        return response()->json(['ok' => true]);
    }

    public function toi(Request $request): JsonResponse
    {
        return response()->json(['nguoiDung' => $request->attributes->get('quyen')->nguoiDung()]);
    }

    public function doiMatKhau(Request $request): JsonResponse
    {
        $d = $request->validate([
            'matKhauCu' => ['required', 'string', 'max:100'],
            'matKhauMoi' => ['required', 'string', 'min:6', 'max:100'],
        ], [
            'matKhauMoi.min' => 'Mật khẩu mới cần ít nhất 6 ký tự.',
        ]);
        $tk = $request->attributes->get('taiKhoan');

        if (!Hash::check($d['matKhauCu'], $tk->mat_khau)) {
            return response()->json(['loi' => 'Mật khẩu hiện tại không đúng.', 'truong' => 'matKhauCu'], 422);
        }
        if ($d['matKhauCu'] === $d['matKhauMoi']) {
            return response()->json(['loi' => 'Mật khẩu mới phải khác mật khẩu hiện tại.', 'truong' => 'matKhauMoi'], 422);
        }
        $tk->forceFill(['mat_khau' => Hash::make($d['matKhauMoi']), 'mac_dinh' => false])->save();
        // Đăng xuất các thiết bị khác, giữ phiên đang dùng
        PhienDangNhap::where('tai_khoan_id', $tk->id)->where('id', '!=', $request->attributes->get('phien')->id)->delete();

        return response()->json(['ok' => true, 'nguoiDung' => (new Quyen($tk->fresh()))->nguoiDung()]);
    }
}
