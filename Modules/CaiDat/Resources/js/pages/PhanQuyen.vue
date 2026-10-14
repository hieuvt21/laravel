<script setup>
import { computed, onMounted, ref } from 'vue';
import { Lock, Plus, Trash2 } from 'lucide-vue-next';
import HopThoai from '@/core/ui/HopThoai.vue';
import { nhomQuyen } from '@/core/registry';
import { useChucVuStore, ID_QUAN_TRI } from '@modules/NhanVien/Resources/js/stores/chucVu';
import { useNhanVienStore } from '@modules/NhanVien/Resources/js/stores/nhanVien';

const chucVu = useChucVuStore();
const nhanVien = useNhanVienStore();

const chonId = ref(ID_QUAN_TRI);
const tenMoi = ref('');
const loiThem = ref('');
const xacNhanXoa = ref(false);
const loi = ref('');

onMounted(() => Promise.all([chucVu.tai(), nhanVien.tai()]));

const dang = computed(() => chucVu.theoId(chonId.value) ?? chucVu.ds[0]);
const khoa = computed(() => !!dang.value?.khoa);
const soNguoi = computed(() => (dang.value ? nhanVien.demTheoChucVu(dang.value.id) : 0));
const coQuyen = (k) => khoa.value || dang.value.quyen.includes(k);

async function luu(data) {
    loi.value = '';
    try { await chucVu.luu(data); } catch (e) { console.error(e); loi.value = 'Không lưu được thay đổi. Vui lòng thử lại.'; }
}
function bat(k) {
    if (khoa.value) return;
    const q = new Set(dang.value.quyen);
    q.has(k) ? q.delete(k) : q.add(k);
    return luu({ ...dang.value, quyen: [...q] });
}
function trangThaiNhom(g) {
    const n = g.items.filter((i) => coQuyen(i.key)).length;
    return n === g.items.length ? 'all' : n ? 'some' : 'none';
}
function batNhom(g) {
    if (khoa.value) return;
    const q = new Set(dang.value.quyen);
    const tat = trangThaiNhom(g) === 'all';
    g.items.forEach((i) => (tat ? q.delete(i.key) : q.add(i.key)));
    return luu({ ...dang.value, quyen: [...q] });
}
function doiTen(e) {
    const t = e.target.value.trim().replace(/\s+/g, ' ');
    if (!t) { e.target.value = dang.value.ten; return; }
    if (t !== dang.value.ten) luu({ ...dang.value, ten: t });
}
async function them() {
    const t = tenMoi.value.trim().replace(/\s+/g, ' ');
    if (!t) { loiThem.value = 'Nhập tên chức vụ.'; return; }
    if (chucVu.ds.some((c) => c.ten.toLowerCase() === t.toLowerCase())) { loiThem.value = 'Chức vụ này đã có.'; return; }
    const doc = await chucVu.luu({ ten: t, quyen: [] });
    tenMoi.value = ''; loiThem.value = ''; chonId.value = doc.id;
}
async function xoa() {
    const id = dang.value.id;
    await chucVu.xoa(id);
    xacNhanXoa.value = false;
    chonId.value = ID_QUAN_TRI;
}
</script>

<template>
    <section>
        <div class="page-head">
            <h1>Phân quyền</h1>
            <p>Chọn chức vụ rồi tích những việc chức vụ đó được làm. Thay đổi được lưu ngay.</p>
        </div>

        <p v-if="chucVu.loi" class="loi" role="alert">{{ chucVu.loi }}</p>

        <div class="khung">
            <aside class="card ds">
                <h2>Chức vụ</h2>
                <ul>
                    <li v-for="c in chucVu.ds" :key="c.id">
                        <button type="button" class="cv" :class="{ on: dang && c.id === dang.id }" :aria-current="dang && c.id === dang.id" @click="chonId = c.id">
                            <span class="cv-ten">{{ c.ten }}</span>
                            <Lock v-if="c.khoa" :size="14" aria-label="Luôn đủ quyền" />
                            <span class="dem" :title="nhanVien.demTheoChucVu(c.id) + ' nhân viên'">{{ nhanVien.demTheoChucVu(c.id) }}</span>
                        </button>
                    </li>
                </ul>
                <form class="them" novalidate @submit.prevent="them">
                    <input v-model="tenMoi" type="text" maxlength="40" placeholder="Tên chức vụ mới" aria-label="Tên chức vụ mới" @input="loiThem = ''" />
                    <button type="submit" class="icon-btn" aria-label="Thêm chức vụ" title="Thêm chức vụ"><Plus :size="18" /></button>
                </form>
                <small v-if="loiThem" class="loi" role="alert">{{ loiThem }}</small>
            </aside>

            <div v-if="dang" class="card ct">
                <header class="ct-dau">
                    <div>
                        <input class="ten-cv" :key="dang.id" :value="dang.ten" maxlength="40" :disabled="khoa" aria-label="Tên chức vụ" @change="doiTen" />
                        <p class="phu">{{ soNguoi }} nhân viên đang giữ chức vụ này</p>
                    </div>
                    <button v-if="!khoa" type="button" class="btn-ghost xoa" @click="xacNhanXoa = true"><Trash2 :size="16" /> Xóa chức vụ</button>
                </header>

                <p v-if="khoa" class="luu-y"><Lock :size="15" /> Quản trị viên luôn có đầy đủ quyền, kể cả quyền mới thêm sau này, nên không chỉnh được.</p>
                <p v-if="loi" class="loi" role="alert">{{ loi }}</p>

                <div v-for="g in nhomQuyen" :key="g.module" class="nhom">
                    <label class="nhom-dau">
                        <input type="checkbox" :checked="trangThaiNhom(g) === 'all'" :indeterminate.prop="trangThaiNhom(g) === 'some'" :disabled="khoa" @change="batNhom(g)" />
                        <span>{{ g.label }}</span>
                    </label>
                    <div class="quyen">
                        <label v-for="i in g.items" :key="i.key" class="q">
                            <input type="checkbox" :checked="coQuyen(i.key)" :disabled="khoa" @change="bat(i.key)" />
                            <span>{{ i.label }}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <HopThoai v-if="xacNhanXoa" tieu-de="Xóa chức vụ" :rong="420" @dong="xacNhanXoa = false">
            <p v-if="soNguoi" class="hoi">Chức vụ <strong>{{ dang.ten }}</strong> đang có {{ soNguoi }} nhân viên. Hãy chuyển họ sang chức vụ khác (trang Nhân viên) trước khi xóa.</p>
            <p v-else class="hoi">Xóa chức vụ <strong>{{ dang.ten }}</strong>?</p>
            <template #chan>
                <button type="button" class="btn-ghost" @click="xacNhanXoa = false">{{ soNguoi ? 'Đóng' : 'Hủy' }}</button>
                <button v-if="!soNguoi" type="button" class="btn-primary nguy" @click="xoa">Xóa</button>
            </template>
        </HopThoai>
    </section>
</template>

<style scoped>
.khung { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; align-items: start; }
h2 { margin: 0 0 10px; font-size: 15px; color: var(--c-navy); }
.ds ul { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 2px; }
.cv { width: 100%; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 10px; border: 0; border-radius: 10px; background: transparent; color: var(--c-muted); text-align: left; }
.cv:hover { background: var(--c-bg); color: var(--c-text); }
.cv.on { background: var(--c-primary-soft); color: var(--c-primary-ink); font-weight: 700; }
.cv-ten { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dem { min-width: 22px; padding: 0 6px; text-align: center; font-size: 12px; font-weight: 700; border-radius: 999px; background: var(--c-bg); color: var(--c-muted); }
.cv.on .dem { background: #fff; }
.them { display: flex; gap: 8px; }
.them input { flex: 1; min-width: 0; height: 38px; padding: 0 10px; font: inherit; border: 1px solid var(--c-line); border-radius: 10px; }
.them input:focus { outline: 0; border-color: var(--c-primary); }
.them .icon-btn { flex: 0 0 auto; width: 38px; height: 38px; }

.ct-dau { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.ten-cv { width: 100%; max-width: 320px; padding: 4px 8px; margin-left: -8px; font: inherit; font-size: 20px; font-weight: 800; color: var(--c-navy); border: 1px solid transparent; border-radius: 8px; background: transparent; }
.ten-cv:hover:not(:disabled) { border-color: var(--c-line); }
.ten-cv:focus { outline: 0; border-color: var(--c-primary); background: #fff; }
.phu { margin: 2px 0 0; font-size: 13px; color: var(--c-muted); }
.xoa:hover { color: var(--c-off); border-color: var(--c-off); }
.luu-y { display: flex; gap: 8px; align-items: flex-start; margin: 0 0 14px; padding: 10px 12px; font-size: 13px; background: var(--c-primary-soft); color: var(--c-primary-ink); border-radius: 10px; }

.nhom { padding: 14px 0; border-top: 1px solid var(--c-line); }
.nhom-dau { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--c-navy); margin-bottom: 10px; }
.quyen { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px 16px; padding-left: 28px; }
.q { display: flex; align-items: center; gap: 10px; min-height: 28px; }
input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--c-primary); flex: 0 0 auto; }
input[type="checkbox"]:disabled { opacity: .6; }
.loi { color: var(--c-off); font-size: 13px; margin: 0 0 10px; }
.hoi { margin: 0; }
.nguy { background: var(--c-off); color: #fff; }
@media (max-width: 860px) { .khung { grid-template-columns: 1fr; } }
</style>
