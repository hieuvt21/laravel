<script setup>
import { computed, reactive, ref } from 'vue';
import HopThoai from '@/core/ui/HopThoai.vue';
import { taoId } from '@/core/kho/kho';
import { useChucVuStore } from '../stores/chucVu';
import { useXacThuc } from '@modules/XacThuc/Resources/js/stores/xacThuc';

// Thêm / sửa nhân viên. Chỉ "Tên" là bắt buộc; Chức vụ cần chọn để phân quyền.
const props = defineProps({
    nhanVien: { type: Object, default: null },
    boLuu: { type: Function, required: true }, // async (data) => void; ném lỗi nếu không lưu được
});
const emit = defineEmits(['dong']);

const chucVu = useChucVuStore();
const auth = useXacThuc();
const tkCu = props.nhanVien?.taiKhoan ?? null; // do server gửi về (chỉ người có quyền sửa nhân viên mới thấy)
// Chỉ người có quyền Phân quyền mới được gán chức vụ Quản trị viên (tránh tự nâng quyền)
const chucVuChon = computed(() => chucVu.ds.filter((c) => !c.khoa || auth.coQuyen('cai-dat.phan-quyen') || c.id === props.nhanVien?.chucVuId));
const xemLuong = auth.coQuyen('nhan-vien.xem-luong');
const form = reactive({
    ten: props.nhanVien?.ten ?? '',
    sdt: props.nhanVien?.sdt ?? '',
    luong: props.nhanVien?.luongCoBan ? String(props.nhanVien.luongCoBan) : '',
    chucVuId: props.nhanVien?.chucVuId ?? (chucVu.theoId('ban-hang') ? 'ban-hang' : chucVu.ds[0]?.id ?? ''),
    ghiChu: props.nhanVien?.ghiChu ?? '',
    tenDangNhap: tkCu?.tenDangNhap ?? '',
    matKhau: '',
    khoa: !!tkCu?.khoa,
});
const loi = reactive({ ten: '', sdt: '', luong: '', dn: '', mk: '' });
const idNhanVien = props.nhanVien?.id ?? taoId(); // cố định ngay từ đầu: lưu lại sau khi tài khoản báo lỗi không tạo thêm bản ghi mới
const dangLuu = ref(false);
const loiChung = ref('');

const luongHienThi = computed({
    get: () => (form.luong === '' ? '' : Number(form.luong).toLocaleString('vi-VN')),
    set: (v) => { form.luong = String(v).replace(/\D/g, '').slice(0, 12); },
});

function kiemTra() {
    loi.ten = form.ten.trim() ? '' : 'Vui lòng nhập tên nhân viên.';
    loi.sdt = !form.sdt.trim() || /^\+?[0-9][0-9 .()-]{7,14}$/.test(form.sdt.trim()) ? '' : 'Số điện thoại chưa đúng.';
    const dn = form.tenDangNhap.trim();
    loi.dn = !dn ? '' : !/^[a-z0-9._-]{3,30}$/i.test(dn) ? 'Chỉ dùng chữ không dấu, số, dấu . _ - (3–30 ký tự).' : '';
    loi.mk = dn && (!tkCu || form.matKhau) && form.matKhau.length < 6 ? 'Mật khẩu cần ít nhất 6 ký tự.' : '';
    return !loi.ten && !loi.sdt && !loi.dn && !loi.mk;
}

async function gui() {
    if (dangLuu.value || !kiemTra()) return;
    dangLuu.value = true;
    loiChung.value = '';
    try {
        await props.boLuu({
            ...(props.nhanVien ?? {}),
            id: idNhanVien,
            ten: form.ten.trim().replace(/\s+/g, ' '),
            sdt: form.sdt.trim(),
            ghiChu: form.ghiChu.trim(),
            luongCoBan: xemLuong ? (form.luong === '' ? 0 : Number(form.luong)) : (props.nhanVien?.luongCoBan ?? 0),
            chucVuId: form.chucVuId,
        }, { tenDangNhap: form.tenDangNhap.trim(), matKhau: form.matKhau, khoa: form.khoa });
    } catch (e) {
        loiChung.value = e?.message || 'Không lưu được. Vui lòng thử lại.';
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
                    <option v-for="c in chucVuChon" :key="c.id" :value="c.id">{{ c.ten }}</option>
                </select>
                <small class="goi-y">Quyết định quyền sử dụng trong Cài đặt › Phân quyền.</small>
            </label>

            <label v-if="xemLuong" class="o full">
                <span>Lương cơ bản (đ)</span>
                <input v-model="luongHienThi" type="text" inputmode="numeric" autocomplete="off" placeholder="0" />
            </label>

            <label class="o full">
                <span>Ghi chú</span>
                <textarea v-model="form.ghiChu" rows="3" maxlength="500"></textarea>
            </label>
            <fieldset class="tk full">
                <legend>Tài khoản đăng nhập</legend>
                <label class="o">
                    <span>Tên đăng nhập</span>
                    <input v-model="form.tenDangNhap" type="text" maxlength="30" autocomplete="off" autocapitalize="none" spellcheck="false" :class="{ sai: loi.dn }" @input="loi.dn = ''" />
                    <small v-if="loi.dn" class="loi" role="alert">{{ loi.dn }}</small>
                </label>
                <label class="o">
                    <span>{{ tkCu ? 'Mật khẩu mới' : 'Mật khẩu' }}</span>
                    <input v-model="form.matKhau" type="password" autocomplete="new-password" :placeholder="tkCu ? 'Để trống nếu không đổi' : ''" :class="{ sai: loi.mk }" @input="loi.mk = ''" />
                    <small v-if="loi.mk" class="loi" role="alert">{{ loi.mk }}</small>
                </label>
                <label v-if="tkCu" class="khoa"><input v-model="form.khoa" type="checkbox" /> Khóa đăng nhập (nhân viên tạm thời không vào được app)</label>
                <small class="goi-y full">Bỏ trống tên đăng nhập nếu nhân viên không cần vào app (đang có tài khoản mà xóa tên đi thì tài khoản bị gỡ).</small>
            </fieldset>
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
.tk { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin: 0; padding: 12px 14px 14px; border: 1px solid var(--c-line); border-radius: 12px; }
.tk legend { padding: 0 6px; font-size: 13px; font-weight: 800; color: var(--c-navy); }
.khoa { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; font-size: 14px; }
.khoa input { width: 18px; height: 18px; accent-color: var(--c-primary); }
@media (max-width: 560px) { .tk { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .luoi { grid-template-columns: 1fr; } }
</style>
