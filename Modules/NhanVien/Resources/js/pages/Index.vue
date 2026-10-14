<script setup>
import { computed, onMounted, ref } from 'vue';
import { Pencil, Plus, Search, Trash2, UserCog } from 'lucide-vue-next';
import HopThoai from '@/core/ui/HopThoai.vue';
import FormNhanVien from '../components/FormNhanVien.vue';
import { useNhanVienStore } from '../stores/nhanVien';
import { useChucVuStore } from '../stores/chucVu';

const store = useNhanVienStore();
const chucVu = useChucVuStore();

const tim = ref('');
const loc = ref('');
const dangSua = ref(null);   // null = đóng; {} = thêm mới; {…} = sửa
const dangXoa = ref(null);
const loiXoa = ref('');

onMounted(() => Promise.all([chucVu.tai(), store.tai()]));

const boDau = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
const danhSach = computed(() => {
    const t = boDau(tim.value.trim());
    return store.ds.filter((n) =>
        (!loc.value || n.chucVuId === loc.value) &&
        (!t || boDau(n.ten).includes(t) || (n.sdt ?? '').replace(/\D/g, '').includes(t.replace(/\D/g, '') || '\u0000')),
    );
});
const tien = (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : '—');
const tenChucVu = (id) => chucVu.theoId(id)?.ten ?? 'Chưa có chức vụ';
const chuCai = (ten) => ten.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();

async function luu(data) {
    await store.luu(data);
    dangSua.value = null;
}
async function xoa() {
    loiXoa.value = '';
    try {
        await store.xoa(dangXoa.value.id);
        dangXoa.value = null;
    } catch (e) {
        console.error(e);
        loiXoa.value = 'Không xóa được. Vui lòng thử lại.';
    }
}
</script>

<template>
    <section>
        <div class="page-head">
            <h1>Nhân viên</h1>
            <p>Quản lý nhân viên và chức vụ của cửa hàng.</p>
        </div>

        <div class="thanh">
            <label class="o-tim">
                <Search :size="16" aria-hidden="true" />
                <input v-model="tim" type="search" placeholder="Tìm theo tên hoặc số điện thoại" aria-label="Tìm nhân viên" />
            </label>
            <select v-model="loc" class="loc" aria-label="Lọc theo chức vụ">
                <option value="">Tất cả chức vụ</option>
                <option v-for="c in chucVu.ds" :key="c.id" :value="c.id">{{ c.ten }}</option>
            </select>
            <button type="button" class="btn-primary them" @click="dangSua = {}"><Plus :size="18" /> Thêm nhân viên</button>
        </div>

        <p v-if="store.loi" class="loi-trang" role="alert">{{ store.loi }}</p>

        <div class="card bang-khung">
            <div v-if="!store.daTai && !store.loi" class="rong">Đang tải…</div>
            <div v-else-if="!store.ds.length" class="rong">
                <UserCog :size="32" aria-hidden="true" />
                <p>Chưa có nhân viên nào.</p>
                <button type="button" class="btn-primary" @click="dangSua = {}"><Plus :size="18" /> Thêm nhân viên đầu tiên</button>
            </div>
            <div v-else-if="!danhSach.length" class="rong">Không tìm thấy nhân viên phù hợp.</div>
            <table v-else class="bang">
                <thead>
                    <tr>
                        <th>Nhân viên</th><th>Số điện thoại</th><th>Chức vụ</th><th class="so">Lương cơ bản</th><th class="thao"><span class="sr-only">Thao tác</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="n in danhSach" :key="n.id">
                        <td>
                            <div class="ten">
                                <span class="av" aria-hidden="true">{{ chuCai(n.ten) }}</span>
                                <div>
                                    <strong>{{ n.ten }}</strong>
                                    <small v-if="n.ghiChu" :title="n.ghiChu">{{ n.ghiChu }}</small>
                                </div>
                            </div>
                        </td>
                        <td>{{ n.sdt || '—' }}</td>
                        <td><span class="nhan" :class="{ mat: !chucVu.theoId(n.chucVuId) }">{{ tenChucVu(n.chucVuId) }}</span></td>
                        <td class="so">{{ tien(n.luongCoBan) }}</td>
                        <td class="thao">
                            <button type="button" class="icon-btn" :aria-label="'Sửa ' + n.ten" title="Sửa" @click="dangSua = n"><Pencil :size="16" /></button>
                            <button type="button" class="icon-btn xoa" :aria-label="'Xóa ' + n.ten" title="Xóa" @click="dangXoa = n; loiXoa = ''"><Trash2 :size="16" /></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <FormNhanVien v-if="dangSua" :nhan-vien="dangSua.id ? dangSua : null" :bo-luu="luu" @dong="dangSua = null" />

        <HopThoai v-if="dangXoa" tieu-de="Xóa nhân viên" :rong="420" @dong="dangXoa = null">
            <p class="hoi">Xóa nhân viên <strong>{{ dangXoa.ten }}</strong>? Thao tác này không hoàn tác được.</p>
            <p v-if="loiXoa" class="loi-trang" role="alert">{{ loiXoa }}</p>
            <template #chan>
                <button type="button" class="btn-ghost" @click="dangXoa = null">Hủy</button>
                <button type="button" class="btn-primary nguy" @click="xoa">Xóa</button>
            </template>
        </HopThoai>
    </section>
</template>

<style scoped>
.thanh { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.o-tim { flex: 1 1 260px; max-width: 380px; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 10px; color: var(--c-muted); }
.o-tim:focus-within { border-color: var(--c-primary); }
.o-tim input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; color: var(--c-text); }
.loc { height: 40px; padding: 0 12px; font: inherit; color: var(--c-text); border: 1px solid var(--c-line); border-radius: 10px; background: var(--c-surface); }
.them { margin-left: auto; }

.bang-khung { position: relative; padding: 0; overflow-x: auto; } /* relative: giữ chữ ẩn (sr-only) trong khung cuộn */
.bang { width: 100%; border-collapse: collapse; min-width: 640px; }
.bang th { text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 700; color: var(--c-muted); background: var(--c-bg); border-bottom: 1px solid var(--c-line); white-space: nowrap; }
.bang td { padding: 12px 16px; border-bottom: 1px solid var(--c-line); vertical-align: middle; }
.bang tbody tr:last-child td { border-bottom: 0; }
.bang tbody tr:hover { background: #fafbfc; }
.so { text-align: right !important; white-space: nowrap; font-variant-numeric: tabular-nums; }
.thao { width: 1%; white-space: nowrap; text-align: right; }
.thao .icon-btn { display: inline-grid; vertical-align: middle; width: 34px; height: 34px; margin-left: 6px; }
.icon-btn.xoa:hover { color: var(--c-off); border-color: var(--c-off); }

.ten { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ten strong { display: block; color: var(--c-navy); }
.ten small { display: block; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--c-muted); }
.av { flex: 0 0 auto; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; background: var(--c-primary-soft); color: var(--c-primary-ink); font-size: 13px; font-weight: 800; }
.nhan { display: inline-block; padding: 3px 10px; border-radius: 999px; background: var(--c-primary-soft); color: var(--c-primary-ink); font-size: 12.5px; font-weight: 700; white-space: nowrap; }
.nhan.mat { background: #fdecec; color: var(--c-off); }

.rong { min-height: 220px; display: grid; place-content: center; justify-items: center; gap: 10px; color: var(--c-muted); padding: 24px; text-align: center; }
.rong p { margin: 0; }
.hoi { margin: 0; }
.loi-trang { color: var(--c-off); margin: 0 0 12px; }
.nguy { background: var(--c-off); color: #fff; }
</style>
