<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Nhật ký thay đổi: mỗi lần thêm/sửa/xóa ghi một dòng, seq tăng dần. Thiết bị hỏi "từ seq N có gì mới?".
        Schema::create('thay_doi', function (Blueprint $t) {
            $t->bigIncrements('seq');
            $t->string('thuc_the', 40);
            $t->string('ban_ghi_id', 36);
            $t->boolean('da_xoa')->default(false);
            $t->timestamp('created_at')->nullable();
            $t->index(['thuc_the', 'ban_ghi_id']);
        });

        // Thao tác thiết bị đã gửi: gửi lại (mất mạng giữa chừng) thì không áp dụng hai lần.
        Schema::create('dong_bo_thao_tac', function (Blueprint $t) {
            $t->string('id', 36)->primary();
            $t->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dong_bo_thao_tac');
        Schema::dropIfExists('thay_doi');
    }
};
