<?php

namespace Modules\NhanVien\Models;

use Illuminate\Database\Eloquent\Model;

class NhanVien extends Model
{
    protected $table = 'nhan_vien';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
}
