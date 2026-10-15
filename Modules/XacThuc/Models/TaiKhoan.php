<?php

namespace Modules\XacThuc\Models;

use Illuminate\Database\Eloquent\Model;

class TaiKhoan extends Model
{
    protected $table = 'tai_khoan';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $hidden = ['mat_khau'];
    protected $casts = ['mac_dinh' => 'boolean', 'khoa' => 'boolean'];
}
