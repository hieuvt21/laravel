<?php

namespace Modules\NhanVien\DongBo;

use Illuminate\Support\Facades\Validator;
use Modules\DongBo\Contracts\ThucTheDongBo;
use Modules\DongBo\Exceptions\ThaoTacBiTuChoi;
use Modules\NhanVien\Models\ChucVu;
use Modules\NhanVien\Models\NhanVien;
use Modules\XacThuc\Services\Quyen;

class ChucVuThucThe implements ThucTheDongBo
{
    public function ten(): string
    {
        return 'chuc_vu';
    }

    // Nhân viên cần danh sách chức vụ để chọn khi thêm/sửa; người phân quyền cần để chỉnh.
    public function duocDoc(Quyen $q): bool
    {
        return $q->co('nhan-vien.xem') || $q->co('cai-dat.phan-quyen');
    }

    public function dongGoi(string $id, Quyen $q): ?array
    {
        if (!$this->duocDoc($q) || !($cv = ChucVu::find($id))) {
            return null;
        }
        return [
            'id' => $cv->id,
            'ten' => $cv->ten,
            'khoa' => $cv->khoa,
            'quyen' => $cv->quyen ?? [],
            'createdAt' => $cv->created_at?->toIso8601String(),
            'updatedAt' => $cv->updated_at?->toIso8601String(),
        ];
    }

    public function luu(string $id, array $duLieu, Quyen $q): void
    {
        if (!$q->co('cai-dat.phan-quyen')) {
            throw new ThaoTacBiTuChoi('Bạn không có quyền quản lý phân quyền.');
        }
        $cu = ChucVu::find($id);
        if ($cu?->khoa) {
            throw new ThaoTacBiTuChoi('Quản trị viên luôn có đầy đủ quyền, không chỉnh sửa được.');
        }
        $d = Validator::make($duLieu, [
            'ten' => ['required', 'string', 'max:40'],
            'quyen' => ['nullable', 'array', 'max:200'],
            'quyen.*' => ['string', 'regex:/^[a-z0-9-]+\.[a-z0-9-]+$/'],
        ], [
            'ten.required' => 'Vui lòng nhập tên chức vụ.',
            'ten.max' => 'Tên chức vụ tối đa 40 ký tự.',
            'quyen.*.regex' => 'Quyền không hợp lệ.',
        ])->validate();

        $ten = trim(preg_replace('/\s+/u', ' ', $d['ten']));
        $trung = ChucVu::whereRaw('LOWER(ten) = ?', [mb_strtolower($ten)])->where('id', '!=', $id)->exists();
        if ($trung) {
            throw new ThaoTacBiTuChoi('Chức vụ này đã có.');
        }

        $cv = $cu ?? new ChucVu(['khoa' => false]);
        $cv->id = $id;
        $cv->ten = $ten;
        $cv->quyen = array_values(array_unique($d['quyen'] ?? []));
        $cv->save();
    }

    public function xoa(string $id, Quyen $q): void
    {
        if (!$q->co('cai-dat.phan-quyen')) {
            throw new ThaoTacBiTuChoi('Bạn không có quyền quản lý phân quyền.');
        }
        $cv = ChucVu::find($id);
        if (!$cv) {
            return;
        }
        if ($cv->khoa) {
            throw new ThaoTacBiTuChoi('Không xóa được chức vụ Quản trị viên.');
        }
        if (NhanVien::where('chuc_vu_id', $id)->exists()) {
            throw new ThaoTacBiTuChoi('Chức vụ đang có nhân viên. Hãy chuyển họ sang chức vụ khác trước khi xóa.');
        }
        $cv->delete();
    }
}
