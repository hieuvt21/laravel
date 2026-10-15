<?php

namespace Modules\XacThuc\Models;

use Illuminate\Database\Eloquent\Model;

class PhienDangNhap extends Model
{
    protected $table = 'phien_dang_nhap';
    protected $guarded = [];
    protected $casts = ['dung_lan_cuoi' => 'datetime', 'het_han' => 'datetime'];
}
