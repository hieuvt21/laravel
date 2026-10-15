<?php

namespace Modules\NhanVien\DongBo;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Modules\DongBo\Contracts\ThucTheDongBo;
use Modules\DongBo\Exceptions\ThaoTacBiTuChoi;
use Modules\NhanVien\Models\ChucVu;
use Modules\NhanVien\Models\NhanVien;
use Modules\XacThuc\Models\PhienDangNhap;
use Modules\XacThuc\Models\TaiKhoan;
use Modules\XacThuc\Services\Quyen;

class NhanVienThucThe implements ThucTheDongBo
{
    public function ten(): string
    {
        return 'nhan_vien';
    }

    public function duocDoc(Quyen $q): bool
    {
        return $q->co('nhan-vien.xem');
    }

    public function dongGoi(string $id, Quyen $q): ?array
    {
        if (!$this->duocDoc($q) || !($nv = NhanVien::find($id))) {
            return null;
        }
        $d = [
            'id' => $nv->id,
            'ten' => $nv->ten,
            'sdt' => $nv->sdt ?? '',
            'ghiChu' => $nv->ghi_chu ?? '',
            'chucVuId' => $nv->chuc_vu_id,
            'createdAt' => $nv->created_at?->toIso8601String(),
            'updatedAt' => $nv->updated_at?->toIso8601String(),
        ];
        // Lương chỉ gửi cho người có quyền xem lương
        if ($q->co('nhan-vien.xem-luong')) {
            $d['luongCoBan'] = (int) $nv->luong_co_ban;
        }
        // Thông tin tài khoản (không bao giờ có mật khẩu) chỉ gửi cho người được sửa nhân viên
        if ($q->co('nhan-vien.them-sua')) {
            $tk = TaiKhoan::where('loai', 'nhan-vien')->where('doi_tuong_id', $id)->first();
            $d['taiKhoan'] = $tk ? ['tenDangNhap' => $tk->ten_dang_nhap, 'khoa' => $tk->khoa] : null;
        }
        return $d;
    }

    public function luu(string $id, array $duLieu, Quyen $q): void
    {
        if (!$q->co('nhan-vien.them-sua')) {
            throw new ThaoTacBiTuChoi('Bạn không có quyền thêm / sửa nhân viên.');
        }
        $d = Validator::make($duLieu, [
            'ten' => ['required', 'string', 'max:100'],
            'sdt' => ['nullable', 'string', 'regex:/^\+?[0-9][0-9 .()-]{7,18}$/'],
            'ghiChu' => ['nullable', 'string', 'max:500'],
            'luongCoBan' => ['nullable', 'integer', 'min:0', 'max:999999999999'],
            'chucVuId' => ['nullable', 'string', 'max:36'],
        ], [
            'ten.required' => 'Vui lòng nhập tên nhân viên.',
            'ten.max' => 'Tên nhân viên tối đa 100 ký tự.',
            'sdt.regex' => 'Số điện thoại chưa đúng.',
            'luongCoBan.integer' => 'Lương không hợp lệ.',
        ])->validate();

        $cu = NhanVien::find($id);

        if (!empty($d['chucVuId'])) {
            $cv = ChucVu::find($d['chucVuId']);
            if (!$cv) {
                throw new ThaoTacBiTuChoi('Chức vụ không tồn tại.');
            }
            // Chặn tự nâng quyền: chỉ người có quyền Phân quyền mới gán chức vụ Quản trị viên
            if ($cv->khoa && $cu?->chuc_vu_id !== $cv->id && !$q->co('cai-dat.phan-quyen')) {
                throw new ThaoTacBiTuChoi('Chỉ người có quyền Phân quyền mới được gán chức vụ Quản trị viên.');
            }
        }
        // Người đang giữ chức vụ Quản trị viên chỉ bị đổi chức vụ bởi người có quyền Phân quyền
        if ($cu && $cu->chuc_vu_id && ($d['chucVuId'] ?? null) !== $cu->chuc_vu_id && !$q->co('cai-dat.phan-quyen')
            && ChucVu::whereKey($cu->chuc_vu_id)->where('khoa', true)->exists()) {
            throw new ThaoTacBiTuChoi('Chỉ người có quyền Phân quyền mới được đổi chức vụ của Quản trị viên.');
        }

        $nv = $cu ?? new NhanVien(['luong_co_ban' => 0]);
        $nv->id = $id;
        $nv->ten = trim(preg_replace('/\s+/u', ' ', $d['ten']));
        $nv->sdt = isset($d['sdt']) && trim($d['sdt']) !== '' ? trim($d['sdt']) : null;
        $nv->ghi_chu = isset($d['ghiChu']) && trim($d['ghiChu']) !== '' ? trim($d['ghiChu']) : null;
        $nv->chuc_vu_id = $d['chucVuId'] ?? null;
        if ($q->co('nhan-vien.xem-luong') && array_key_exists('luongCoBan', $d) && $d['luongCoBan'] !== null) {
            $nv->luong_co_ban = (int) $d['luongCoBan'];
        }
        $nv->save();

        TaiKhoan::where('loai', 'nhan-vien')->where('doi_tuong_id', $id)->update(['ten' => $nv->ten]);
    }

    public function xoa(string $id, Quyen $q): void
    {
        if (!$q->co('nhan-vien.xoa')) {
            throw new ThaoTacBiTuChoi('Bạn không có quyền xóa nhân viên.');
        }
        $nv = NhanVien::find($id);
        if (!$nv) {
            return;
        }
        if ($nv->chuc_vu_id && !$q->co('cai-dat.phan-quyen') && ChucVu::whereKey($nv->chuc_vu_id)->where('khoa', true)->exists()) {
            throw new ThaoTacBiTuChoi('Chỉ người có quyền Phân quyền mới được xóa Quản trị viên.');
        }
        $tk = TaiKhoan::where('loai', 'nhan-vien')->where('doi_tuong_id', $id)->first();
        if ($tk && $tk->id === $q->tk->id) {
            throw new ThaoTacBiTuChoi('Không thể xóa chính tài khoản đang đăng nhập.');
        }
        if ($tk) {
            PhienDangNhap::where('tai_khoan_id', $tk->id)->delete();
            $tk->delete();
        }
        $nv->delete();
    }
}
