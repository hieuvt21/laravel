<?php

namespace Modules\DongBo\Contracts;

use Modules\XacThuc\Services\Quyen;

/**
 * Một loại dữ liệu đồng bộ được (nhân viên, chức vụ, sản phẩm...).
 * Mọi kiểm tra quyền và dữ liệu hợp lệ nằm ở đây, phía server, không tin giao diện.
 */
interface ThucTheDongBo
{
    /** Tên dùng chung với giao diện, ví dụ 'nhan_vien'. */
    public function ten(): string;

    /** Người này có được tải loại dữ liệu này về không? */
    public function duocDoc(Quyen $q): bool;

    /** Bản ghi ở dạng gửi cho giao diện (đã ẩn trường không được xem), null nếu không có / không được xem. */
    public function dongGoi(string $id, Quyen $q): ?array;

    /** Thêm hoặc sửa. Ném ThaoTacBiTuChoi hoặc ValidationException nếu không hợp lệ. */
    public function luu(string $id, array $duLieu, Quyen $q): void;

    /** Xóa. Ném ThaoTacBiTuChoi nếu không được phép. */
    public function xoa(string $id, Quyen $q): void;
}
