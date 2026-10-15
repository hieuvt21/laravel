<?php

namespace Modules\XacThuc\Services;

use Illuminate\Support\Facades\DB;
use Modules\XacThuc\Models\TaiKhoan;

/**
 * Quyền của một tài khoản, luôn đọc từ database tại thời điểm gọi API
 * (đổi chức vụ / phân quyền có hiệu lực ngay, không phụ thuộc token cũ).
 * Quản trị viên (tài khoản admin hoặc chức vụ khóa "Quản trị viên") có mọi quyền: ['*'].
 */
class Quyen
{
    private bool $daNap = false;
    private ?object $nhanVien = null;
    private ?object $chucVu = null;

    public function __construct(public readonly TaiKhoan $tk)
    {
    }

    private function nap(): void
    {
        if ($this->daNap) {
            return;
        }
        $this->daNap = true;
        if ($this->tk->loai === 'nhan-vien') {
            $this->nhanVien = DB::table('nhan_vien')->where('id', $this->tk->doi_tuong_id)->first();
            if ($this->nhanVien && $this->nhanVien->chuc_vu_id) {
                $this->chucVu = DB::table('chuc_vu')->where('id', $this->nhanVien->chuc_vu_id)->first();
            }
        }
    }

    /** Tài khoản còn gắn với một nhân viên / khách hàng hợp lệ? */
    public function hopLe(): bool
    {
        $this->nap();
        return match ($this->tk->loai) {
            'admin', 'khach-hang' => true,
            'nhan-vien' => $this->nhanVien !== null,
            default => false,
        };
    }

    public function danhSach(): array
    {
        $this->nap();
        if ($this->tk->loai === 'admin') {
            return ['*'];
        }
        if ($this->tk->loai !== 'nhan-vien' || !$this->chucVu) {
            return [];
        }
        if ($this->chucVu->khoa) {
            return ['*'];
        }
        $q = json_decode((string) $this->chucVu->quyen, true);
        return is_array($q) ? array_values(array_filter($q, 'is_string')) : [];
    }

    public function co(string $khoa): bool
    {
        $ds = $this->danhSach();
        return in_array('*', $ds, true) || in_array($khoa, $ds, true);
    }

    /** Thông tin người dùng gửi cho giao diện. */
    public function nguoiDung(): array
    {
        $this->nap();
        $ds = $this->danhSach();
        sort($ds);
        return [
            'taiKhoanId' => $this->tk->id,
            'tenDangNhap' => $this->tk->ten_dang_nhap,
            'loai' => $this->tk->loai,
            'ten' => $this->nhanVien->ten ?? $this->tk->ten,
            'chucVu' => $this->tk->loai === 'admin' ? 'Quản trị viên' : ($this->chucVu->ten ?? ''),
            'quyen' => $ds,
            'macDinh' => (bool) $this->tk->mac_dinh,
        ];
    }

    /** Dấu vân tay của bộ quyền: đổi thì giao diện biết cần tải lại dữ liệu. */
    public function phienBan(): string
    {
        $ds = $this->danhSach();
        sort($ds);
        return md5(json_encode($ds));
    }
}
