<?php

namespace Modules\DongBo\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\DongBo\Contracts\ThucTheDongBo;
use Modules\DongBo\Exceptions\ThaoTacBiTuChoi;
use Modules\XacThuc\Services\Quyen;

class DongBoService
{
    /** @var array<string, ThucTheDongBo> */
    private array $thucThe = [];

    public function __construct(iterable $ds)
    {
        foreach ($ds as $t) {
            $this->thucThe[$t->ten()] = $t;
        }
    }

    /** Ghi một dòng vào nhật ký thay đổi (gọi sau mỗi lần dữ liệu đổi, kể cả đổi ngoài luồng đồng bộ). */
    public static function ghi(string $thucThe, string $banGhiId, bool $daXoa = false): void
    {
        DB::table('thay_doi')->insert([
            'thuc_the' => $thucThe,
            'ban_ghi_id' => $banGhiId,
            'da_xoa' => $daXoa,
            'created_at' => now(),
        ]);
    }

    /** Loại dữ liệu mà người này được tải về. */
    public function quyenDoc(Quyen $q): array
    {
        $kq = [];
        foreach ($this->thucThe as $ten => $t) {
            if ($t->duocDoc($q)) {
                $kq[] = $ten;
            }
        }
        return $kq;
    }

    /**
     * Nhận các thao tác thiết bị đã làm khi offline. Xử lý lần lượt, mỗi thao tác một giao dịch riêng:
     * thao tác sai không làm hỏng thao tác khác. Trả kết quả từng thao tác kèm trạng thái hiện tại của bản ghi
     * khi bị từ chối, để thiết bị khôi phục lại bản đúng.
     */
    public function day(array $cacThaoTac, Quyen $q): array
    {
        $kq = [];
        foreach ($cacThaoTac as $op) {
            $op = is_array($op) ? $op : [];
            $opId = (string) ($op['id'] ?? '');
            $ten = (string) ($op['thucThe'] ?? '');
            $banGhiId = (string) ($op['banGhiId'] ?? '');
            $loai = (string) ($op['loai'] ?? '');
            $tt = $this->thucThe[$ten] ?? null;

            try {
                if (!preg_match('/^[A-Za-z0-9-]{1,36}$/', $opId) || !preg_match('/^[A-Za-z0-9-]{1,36}$/', $banGhiId)) {
                    throw new ThaoTacBiTuChoi('Thao tác không hợp lệ.');
                }
                if (!$tt) {
                    throw new ThaoTacBiTuChoi('Loại dữ liệu không được hỗ trợ.');
                }
                if (!in_array($loai, ['luu', 'xoa'], true)) {
                    throw new ThaoTacBiTuChoi('Thao tác không hợp lệ.');
                }

                DB::transaction(function () use ($opId, $tt, $ten, $banGhiId, $loai, $op, $q) {
                    if (DB::table('dong_bo_thao_tac')->where('id', $opId)->exists()) {
                        return; // đã xử lý ở lần gửi trước
                    }
                    if ($loai === 'luu') {
                        $tt->luu($banGhiId, is_array($op['duLieu'] ?? null) ? $op['duLieu'] : [], $q);
                        self::ghi($ten, $banGhiId, false);
                    } else {
                        $tt->xoa($banGhiId, $q);
                        self::ghi($ten, $banGhiId, true);
                    }
                    DB::table('dong_bo_thao_tac')->insert(['id' => $opId, 'created_at' => now()]);
                });
                $kq[] = ['id' => $opId, 'ok' => true];
            } catch (ThaoTacBiTuChoi|ValidationException $e) {
                $loi = $e instanceof ValidationException
                    ? (string) collect($e->errors())->flatten()->first()
                    : $e->getMessage();
                $kq[] = [
                    'id' => $opId,
                    'ok' => false,
                    'loi' => $loi,
                    'banGhi' => $tt && preg_match('/^[A-Za-z0-9-]{1,36}$/', $banGhiId) ? $tt->dongGoi($banGhiId, $q) : null,
                ];
            }
        }
        return $kq;
    }

    /**
     * Trả các thay đổi có seq > $since (tối đa $gioiHan dòng nhật ký mỗi lần).
     * Mỗi bản ghi chỉ trả trạng thái mới nhất. Trường không được xem đã bị ẩn.
     */
    public function keo(int $since, Quyen $q, int $gioiHan = 300): array
    {
        $moiNhat = (int) DB::table('thay_doi')->max('seq');
        $dong = DB::table('thay_doi')->where('seq', '>', $since)->orderBy('seq')->limit($gioiHan)->get();
        $cuoi = $dong->isEmpty() ? max($since, $moiNhat) : (int) $dong->last()->seq;

        $gop = [];
        foreach ($dong as $d) {
            $gop[$d->thuc_the . '|' . $d->ban_ghi_id] = $d; // dòng sau ghi đè dòng trước
        }

        $thayDoi = [];
        foreach ($gop as $d) {
            $tt = $this->thucThe[$d->thuc_the] ?? null;
            if (!$tt || !$tt->duocDoc($q)) {
                continue;
            }
            $bg = $d->da_xoa ? null : $tt->dongGoi($d->ban_ghi_id, $q);
            $thayDoi[] = $bg === null
                ? ['seq' => (int) $d->seq, 'thucThe' => $d->thuc_the, 'banGhiId' => $d->ban_ghi_id, 'xoa' => true]
                : ['seq' => (int) $d->seq, 'thucThe' => $d->thuc_the, 'banGhiId' => $d->ban_ghi_id, 'xoa' => false, 'banGhi' => $bg];
        }

        return [
            'seq' => $cuoi,
            'tiepTuc' => $cuoi < $moiNhat,
            'thayDoi' => $thayDoi,
            'quyenDoc' => $this->quyenDoc($q),
            'phienBanQuyen' => $q->phienBan(),
            'nguoiDung' => $q->nguoiDung(),
        ];
    }
}
