<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phien_dang_nhap', function (Blueprint $t) {
            $t->id();
            $t->string('tai_khoan_id', 36)->index();
            $t->string('ma_hash', 64)->unique(); // SHA-256 của token, không lưu token gốc
            $t->string('thiet_bi', 100)->nullable();
            $t->timestamp('dung_lan_cuoi')->nullable();
            $t->timestamp('het_han')->nullable()->index();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phien_dang_nhap');
    }
};
