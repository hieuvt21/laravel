<?php

namespace Modules\NhanVien\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\DongBo\Services\DongBoService;
use Modules\NhanVien\Models\ChucVu;
use Modules\NhanVien\Models\NhanVien;
use Modules\XacThuc\Models\PhienDangNhap;
use Modules\XacThuc\Models\TaiKhoan;

/** Tạo / sửa / gỡ tài khoản đăng nhập của một nhân viên. Mật khẩu chỉ đi qua đây, không đi theo hàng đợi đồng bộ. */
class TaiKhoanNhanVienController extends Controller
{
    private function kiemTra(Request $request, string $id): array|JsonResponse
    {
        $q = $request->attributes->get('quyen');
        if (!$q->co('nhan-vien.them-sua')) {
            return response()->json(['loi' => 'Bạn không có quyền sửa nhân viên.'], 403);
        }
        $nv = NhanVien::find($id);
        if (!$nv) {
            return response()->json(['loi' => 'Nhân viên chưa có trên máy chủ. Hãy đợi đồng bộ xong rồi thử lại.'], 404);
        }
        // Chặn chiếm quyền: sửa tài khoản của Quản trị viên cần quyền Phân quyền
        if ($nv->chuc_vu_id && !$q->co('cai-dat.phan-quyen') && ChucVu::whereKey($nv->chuc_vu_id)->where('khoa', true)->exists()) {
            return response()->json(['loi' => 'Chỉ người có quyền Phân quyền mới được sửa tài khoản của Quản trị viên.'], 403);
        }
        return [$q, $nv];
    }

    public function luu(Request $request, string $id): JsonResponse
    {
        $r = $this->kiemTra($request, $id);
        if ($r instanceof JsonResponse) {
            return $r;
        }
        [$q, $nv] = $r;

        $d = $request->validate([
            'tenDangNhap' => ['required', 'string', 'regex:/^[A-Za-z0-9._-]{3,30}$/'],
            'matKhau' => ['nullable', 'string', 'min:6', 'max:100'],
            'khoa' => ['nullable', 'boolean'],
        ], [
            'tenDangNhap.regex' => 'Tên đăng nhập chỉ dùng chữ không dấu, số, dấu . _ - (3–30 ký tự).',
            'matKhau.min' => 'Mật khẩu cần ít nhất 6 ký tự.',
        ]);
        $ten = mb_strtolower($d['tenDangNhap']);
        $tk = TaiKhoan::where('loai', 'nhan-vien')->where('doi_tuong_id', $id)->first();

        $trung = TaiKhoan::where('ten_dang_nhap', $ten)->when($tk, fn ($x) => $x->where('id', '!=', $tk->id))->exists();
        if ($trung) {
            return response()->json(['loi' => 'Tên đăng nhập này đã có người dùng.', 'truong' => 'tenDangNhap'], 422);
        }
        if (!$tk && empty($d['matKhau'])) {
            return response()->json(['loi' => 'Cần nhập mật khẩu khi tạo tài khoản.', 'truong' => 'matKhau'], 422);
        }
        if ($tk && $tk->id === $q->tk->id && !empty($d['khoa'])) {
            return response()->json(['loi' => 'Không thể tự khóa tài khoản đang đăng nhập.'], 422);
        }

        $tk ??= new TaiKhoan(['id' => (string) Str::uuid(), 'loai' => 'nhan-vien', 'doi_tuong_id' => $id, 'mac_dinh' => false]);
        $tk->ten_dang_nhap = $ten;
        $tk->ten = $nv->ten;
        $tk->khoa = (bool) ($d['khoa'] ?? false);
        $doiMatKhau = !empty($d['matKhau']);
        if ($doiMatKhau) {
            $tk->mat_khau = Hash::make($d['matKhau']);
            $tk->mac_dinh = false;
        }
        $tk->save();

        // Khóa hoặc đặt lại mật khẩu: các phiên đang mở bị thu hồi
        if ($tk->khoa || $doiMatKhau) {
            PhienDangNhap::where('tai_khoan_id', $tk->id)->delete();
        }
        $nv->touch();
        DongBoService::ghi('nhan_vien', $id, false); // để các máy khác thấy thay đổi tài khoản

        return response()->json(['tenDangNhap' => $tk->ten_dang_nhap, 'khoa' => $tk->khoa]);
    }

    public function go(Request $request, string $id): JsonResponse
    {
        $r = $this->kiemTra($request, $id);
        if ($r instanceof JsonResponse) {
            return $r;
        }
        $tk = TaiKhoan::where('loai', 'nhan-vien')->where('doi_tuong_id', $id)->first();
        if ($tk) {
            if ($tk->id === $request->attributes->get('quyen')->tk->id) {
                return response()->json(['loi' => 'Không thể gỡ tài khoản đang đăng nhập.'], 422);
            }
            PhienDangNhap::where('tai_khoan_id', $tk->id)->delete();
            $tk->delete();
            $r[1]->touch();
            DongBoService::ghi('nhan_vien', $id, false);
        }
        return response()->json(['ok' => true]);
    }
}
