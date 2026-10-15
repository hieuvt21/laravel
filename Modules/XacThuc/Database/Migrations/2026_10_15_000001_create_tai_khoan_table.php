<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_khoan', function (Blueprint $t) {
            $t->string('id', 36)->primary();
            $t->string('ten_dang_nhap', 30)->unique(); // luôn lưu chữ thường
            $t->string('ten', 100);
            $t->string('loai', 20);                    // admin | nhan-vien | khach-hang
            $t->string('doi_tuong_id', 36)->nullable()->index(); // id nhân viên / khách hàng
            $t->string('mat_khau');
            $t->boolean('mac_dinh')->default(false);   // còn dùng mật khẩu mặc định
            $t->boolean('khoa')->default(false);
            $t->timestamps();
        });

        // Tài khoản quản trị mặc định: admin / 123456 (hệ thống nhắc đổi ngay khi đăng nhập)
        DB::table('tai_khoan')->insert([
            'id' => 'admin',
            'ten_dang_nhap' => 'admin',
            'ten' => 'Quản trị',
            'loai' => 'admin',
            'mat_khau' => Hash::make('123456'),
            'mac_dinh' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_khoan');
    }
};
