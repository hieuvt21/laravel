<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chuc_vu', function (Blueprint $t) {
            $t->string('id', 36)->primary();
            $t->string('ten', 40);
            $t->boolean('khoa')->default(false); // chức vụ khóa (Quản trị viên): luôn đủ quyền, không sửa/xóa được
            $t->json('quyen');
            $t->timestamps();
        });

        Schema::create('nhan_vien', function (Blueprint $t) {
            $t->string('id', 36)->primary();
            $t->string('ten', 100);
            $t->string('sdt', 20)->nullable();
            $t->string('ghi_chu', 500)->nullable();
            $t->unsignedBigInteger('luong_co_ban')->default(0);
            $t->string('chuc_vu_id', 36)->nullable()->index();
            $t->timestamps();
        });

        // Chức vụ mặc định. Quản trị viên có mọi quyền nên không cần liệt kê.
        $tatCa = [
            'ban-hang.xem', 'ban-hang.tao-don', 'ban-hang.giam-gia', 'ban-hang.sua-gia', 'ban-hang.xem-lich-su', 'ban-hang.huy-don',
            'san-pham.xem', 'san-pham.them-sua', 'san-pham.xoa', 'san-pham.xem-gia-von', 'san-pham.dieu-chinh-kho',
            'dich-vu.xem', 'dich-vu.them-sua', 'dich-vu.xoa',
            'khach-hang.xem', 'khach-hang.them-sua', 'khach-hang.xoa', 'khach-hang.xem-lich-su',
            'nhan-vien.xem', 'nhan-vien.them-sua', 'nhan-vien.xoa', 'nhan-vien.xem-luong',
            'cai-dat.giao-dien', 'cai-dat.phan-quyen',
        ];
        $mac_dinh = [
            ['quan-tri', 'Quản trị viên', true, []],
            ['quan-ly', 'Quản lý', false, array_values(array_diff($tatCa, ['cai-dat.phan-quyen', 'nhan-vien.xem-luong']))],
            ['ban-hang', 'Bán hàng', false, ['ban-hang.xem', 'ban-hang.tao-don', 'ban-hang.giam-gia', 'ban-hang.xem-lich-su', 'san-pham.xem', 'dich-vu.xem', 'khach-hang.xem', 'khach-hang.them-sua', 'khach-hang.xem-lich-su']],
            ['phuc-vu', 'Phục vụ', false, ['ban-hang.xem', 'ban-hang.tao-don', 'san-pham.xem', 'dich-vu.xem']],
            ['thu-kho', 'Thủ kho', false, ['san-pham.xem', 'san-pham.them-sua', 'san-pham.dieu-chinh-kho']],
        ];
        foreach ($mac_dinh as [$id, $ten, $khoa, $quyen]) {
            DB::table('chuc_vu')->insert([
                'id' => $id, 'ten' => $ten, 'khoa' => $khoa, 'quyen' => json_encode($quyen),
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('thay_doi')->insert(['thuc_the' => 'chuc_vu', 'ban_ghi_id' => $id, 'da_xoa' => false, 'created_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('nhan_vien');
        Schema::dropIfExists('chuc_vu');
    }
};
