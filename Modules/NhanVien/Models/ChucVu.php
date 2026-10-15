<?php

namespace Modules\NhanVien\Models;

use Illuminate\Database\Eloquent\Model;

class ChucVu extends Model
{
    protected $table = 'chuc_vu';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['khoa' => 'boolean', 'quyen' => 'array'];
}
