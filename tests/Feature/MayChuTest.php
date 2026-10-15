<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Chạy: php artisan test   (cần DB test, ví dụ sqlite :memory: trong phpunit.xml)
 * Kiểm tra đăng nhập, phân quyền và đồng bộ ở phía máy chủ.
 */
class MayChuTest extends TestCase
{
    use RefreshDatabase;

    private function dangNhap(string $ten = 'admin', string $mk = '123456'): string
    {
        $r = $this->postJson('/api/dang-nhap', ['tenDangNhap' => $ten, 'matKhau' => $mk]);
        $r->assertOk()->assertJsonStructure(['token', 'nguoiDung']);
        return $r->json('token');
    }

    private function h(string $token): array { return ['Authorization' => 'Bearer ' . $token]; }

    private function day(string $token, array $ops)
    {
        return $this->withHeaders($this->h($token))->postJson('/api/dong-bo/day', ['cacThaoTac' => $ops]);
    }

    public function test_dang_nhap_sai_bi_tu_choi(): void
    {
        $this->postJson('/api/dang-nhap', ['tenDangNhap' => 'admin', 'matKhau' => 'sai'])->assertStatus(401);
    }

    public function test_khong_token_bi_401(): void
    {
        $this->getJson('/api/toi')->assertStatus(401);
        $this->getJson('/api/dong-bo/keo?since=0')->assertStatus(401);
    }

    public function test_doi_mat_khau_thu_hoi_phien_khac(): void
    {
        $t1 = $this->dangNhap();
        $t2 = $this->dangNhap();
        $this->withHeaders($this->h($t1))->postJson('/api/doi-mat-khau', ['matKhauCu' => '123456', 'matKhauMoi' => 'matkhau-moi-1'])->assertOk();
        $this->withHeaders($this->h($t2))->getJson('/api/toi')->assertStatus(401);
        $this->dangNhap('admin', 'matkhau-moi-1');
    }

    public function test_keo_lan_dau_co_5_chuc_vu_mac_dinh(): void
    {
        $t = $this->dangNhap();
        $r = $this->withHeaders($this->h($t))->getJson('/api/dong-bo/keo?since=0')->assertOk();
        $ids = collect($r->json('thayDoi'))->where('thucThe', 'chuc_vu')->pluck('banGhiId');
        $this->assertCount(5, $ids);
    }

    public function test_gui_lap_cung_thao_tac_khong_nhan_doi(): void
    {
        $t = $this->dangNhap();
        $op = ['id' => 'op-1', 'thucThe' => 'nhan_vien', 'banGhiId' => 'nv-1', 'loai' => 'luu',
               'duLieu' => ['ten' => 'An', 'chucVuId' => 'ban-hang']];
        $this->day($t, [$op])->assertOk();
        $this->day($t, [$op])->assertOk()->assertJsonPath('ketQua.0.ok', true);
        $this->assertDatabaseCount('nhan_vien', 1);
    }

    public function test_nhan_vien_khong_du_quyen_bi_chan(): void
    {
        $t = $this->dangNhap();
        $this->day($t, [['id' => 'op-2', 'thucThe' => 'nhan_vien', 'banGhiId' => 'nv-2', 'loai' => 'luu',
                         'duLieu' => ['ten' => 'Bình', 'chucVuId' => 'phuc-vu']]])->assertOk();
        $this->withHeaders($this->h($t))->putJson('/api/nhan-vien/nv-2/tai-khoan', ['tenDangNhap' => 'binhpv', 'matKhau' => 'binh12345'])->assertOk();

        $tb = $this->dangNhap('binhpv', 'binh12345'); // chức vụ Phục vụ: không có quyền nhân viên
        $r = $this->day($tb, [['id' => 'op-3', 'thucThe' => 'nhan_vien', 'banGhiId' => 'hack', 'loai' => 'luu',
                               'duLieu' => ['ten' => 'Hack', 'chucVuId' => 'quan-tri']]])->assertOk();
        $this->assertFalse($r->json('ketQua.0.ok'));
        $this->assertDatabaseMissing('nhan_vien', ['id' => 'hack']);

        $keo = $this->withHeaders($this->h($tb))->getJson('/api/dong-bo/keo?since=0')->assertOk();
        $this->assertEmpty(collect($keo->json('thayDoi'))->whereIn('thucThe', ['nhan_vien', 'chuc_vu']));
    }

    public function test_xoa_nhan_vien_go_tai_khoan_va_het_phien(): void
    {
        $ta = $this->dangNhap();
        $this->day($ta, [['id' => 'op-4', 'thucThe' => 'nhan_vien', 'banGhiId' => 'nv-4', 'loai' => 'luu',
                          'duLieu' => ['ten' => 'Cường', 'chucVuId' => 'ban-hang']]]);
        $this->withHeaders($this->h($ta))->putJson('/api/nhan-vien/nv-4/tai-khoan', ['tenDangNhap' => 'cuongbh', 'matKhau' => 'cuong1234']);
        $tc = $this->dangNhap('cuongbh', 'cuong1234');
        $this->day($ta, [['id' => 'op-5', 'thucThe' => 'nhan_vien', 'banGhiId' => 'nv-4', 'loai' => 'xoa']])->assertOk();
        $this->withHeaders($this->h($tc))->getJson('/api/toi')->assertStatus(401);
    }
}
