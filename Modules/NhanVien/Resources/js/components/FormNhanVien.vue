<script setup>
import { computed, reactive, ref } from 'vue';
import HopThoai from '@/core/ui/HopThoai.vue';
import { useChucVuStore } from '../stores/chucVu';

// Thêm / sửa nhân viên. Chỉ "Tên" là bắt buộc; Chức vụ cần chọn để phân quyền.
const props = defineProps({
    nhanVien: { type: Object, default: null },
    boLuu: { type: Function, required: true }, // async (data) => void; ném lỗi nếu không lưu được
});
const emit = defineEmits(['dong']);

const chucVu = useChucVuStore();
const form = reactive({
    ten: props.nhanVien?.ten ?? '',
    sdt: props.nhanVien?.sdt ?? '',
    luong: props.nhanVien?.luongCoBan ? String(props.nhanVien.luongCoBan) : '',
    chucVuId: props.nhanVien?.chucVuId ?? (chucVu.theoId('ban-hang') ? 'ban-hang' : chucVu.ds[0]?.id ?? ''),
    ghiChu: props.nhanVien?.ghiChu ?? '',
});
const loi = reactive({ ten: '', sdt: '', luong: '' });
const dangLuu = ref(false);
const loiChung = ref('');

const luongHienThi = computed({
    get: () => (form.luong === '' ? '' : Number(form.luong).toLocaleString('vi-VN')),
    set: (v) => { form.luong = String(v).replace(/\D/g, '').slice(0, 12); },
});

function kiemTra() {
    loi.ten = form.ten.trim() ? '' : 'Vui lòng nhập tên nhân viên.';
    loi.sdt = !form.sdt.trim() || /^\+?[0-9][0-9 .()-]{7,14}$/.test(form.sdt.trim()) ? '' : 'Số điện thoại chưa đúng.';
    return !loi.ten && !loi.sdt;
}

async function gui() {
    if (dangLuu.value || !kiemTra()) return;
    dangLuu.value = true;
    loiChung.value = '';
    try {
        await props.boLuu({
            ...(props.nhanVien ?? {}),
            ten: form.ten.trim().replace(/\s+/g, ' '),
            sdt: form.sdt.trim(),
            ghiChu: form.ghiChu.trim(),
            luongCoBan: form.luong === '' ? 0 : Number(form.luong),
            chucVuId: form.chucVuId,
        });
    } catch (e) {
        console.error(e);
        loiChung.value = 'Không lưu được. Vui lòng thử lại.';
    } finally {
        dangLuu.value = false;
    }
}
</script>

<template>
    <HopThoai :tieu-de="nhanVien ? 'Sửa nhân viên' : 'Thêm nhân viên'" @dong="emit('dong')">
        <form id="form-nv" class="luoi" novalidate @submit.prevent="gui">
            <label class="o full">
                <span>Tên nhân viên <b class="bb">*</b></span>
                <input v-model="form.ten" type="text" maxlength="100" autocomplete="off" :class="{ sai: loi.ten }" @input="loi.ten = ''" />
                <small v-if="loi.ten" class="loi" role="alert">{{ loi.ten }}</small>
            </label>

            <label class="o">
                <span>Số điện thoại</span>
                <input v-model="form.sdt" type="tel" inputmode="tel" maxlength="16" autocomplete="off" :class="{ sai: loi.sdt }" @input="loi.sdt = ''" />
                <small v-if="loi.sdt" class="loi" role="alert">{{ loi.sdt }}</small>
            </label>

            <label class="o">
                <span>Chức vụ</span>
                <select v-model="form.chucVuId">
                    <option v-for="c in chucVu.ds" :key="c.id" :value="c.id">{{ c.ten }}</option>
                </select>
                <small class="goi-y">Quyết định quyền sử dụng trong Cài đặt › Phân quyền.</small>
            </label>

            <label class="o full">
                <span>Lương cơ bản (đ)</span>
                <input v-model="luongHienThi" type="text" inputmode="numeric" autocomplete="off" placeholder="0" />
            </label>

            <label class="o full">
                <span>Ghi chú</span>
                <textarea v-model="form.ghiChu" rows="3" maxlength="500"></textarea>
            </label>
            <p v-if="loiChung" class="loi full" role="alert">{{ loiChung }}</p>
        </form>

        <template #chan>
            <button type="button" class="btn-ghost" @click="emit('dong')">Hủy</button>
            <button type="submit" form="form-nv" class="btn-primary" :disabled="dangLuu">{{ nhanVien ? 'Lưu thay đổi' : 'Thêm nhân viên' }}</button>
        </template>
    </HopThoai>
</template>

<style scoped>
.luoi { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.full { grid-column: 1 / -1; }
.o { display: grid; gap: 6px; align-content: start; }
.o > span { font-size: 13px; font-weight: 700; color: var(--c-navy); }
.bb { color: var(--c-off); }
input, select, textarea {
    width: 100%; padding: 9px 12px; font: inherit; color: var(--c-text);
    border: 1px solid var(--c-line); border-radius: 10px; background: var(--c-surface);
}
input, select { height: 40px; }
textarea { resize: vertical; }
input:focus, select:focus, textarea:focus { outline: 0; border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-soft); }
.sai { border-color: var(--c-off); }
.loi { color: var(--c-off); font-size: 12.5px; margin: 0; }
.goi-y { color: var(--c-muted); font-size: 12px; }
button[disabled] { opacity: .6; cursor: default; }
@media (max-width: 560px) { .luoi { grid-template-columns: 1fr; } }
</style>
