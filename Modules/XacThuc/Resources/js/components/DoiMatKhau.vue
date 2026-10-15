<script setup>
import { reactive, ref } from 'vue';
import HopThoai from '@/core/ui/HopThoai.vue';
import { useXacThuc } from '../stores/xacThuc';

const emit = defineEmits(['dong', 'xong']);
const auth = useXacThuc();
const f = reactive({ cu: '', moi: '', lai: '' });
const loi = reactive({ cu: '', moi: '', lai: '', chung: '' });
const dang = ref(false);

async function gui() {
    if (dang.value) return;
    loi.cu = f.cu ? '' : 'Nhập mật khẩu hiện tại.';
    loi.moi = f.moi.length >= 6 ? '' : 'Mật khẩu mới cần ít nhất 6 ký tự.';
    loi.lai = f.lai === f.moi ? '' : 'Mật khẩu nhập lại chưa khớp.';
    if (!loi.moi && f.moi === f.cu) loi.moi = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    if (loi.cu || loi.moi || loi.lai) return;
    dang.value = true; loi.chung = '';
    try {
        const kq = await auth.doiMatKhau(f.cu, f.moi);
        if (!kq.ok) {
            if (kq.truong === 'matKhauCu') loi.cu = kq.loi;
            else if (kq.truong === 'matKhauMoi') loi.moi = kq.loi;
            else loi.chung = kq.loi;
            return;
        }
        emit('xong'); emit('dong');
    } catch (e) {
        console.error(e); loi.chung = 'Không đổi được mật khẩu. Vui lòng thử lại.';
    } finally { dang.value = false; }
}
</script>

<template>
    <HopThoai tieu-de="Đổi mật khẩu" :rong="420" @dong="emit('dong')">
        <form id="form-mk" class="luoi" novalidate @submit.prevent="gui">
            <label class="o"><span>Mật khẩu hiện tại</span>
                <input v-model="f.cu" type="password" autocomplete="current-password" :class="{ sai: loi.cu }" @input="loi.cu = ''" />
                <small v-if="loi.cu" class="loi" role="alert">{{ loi.cu }}</small></label>
            <label class="o"><span>Mật khẩu mới</span>
                <input v-model="f.moi" type="password" autocomplete="new-password" :class="{ sai: loi.moi }" @input="loi.moi = ''" />
                <small v-if="loi.moi" class="loi" role="alert">{{ loi.moi }}</small></label>
            <label class="o"><span>Nhập lại mật khẩu mới</span>
                <input v-model="f.lai" type="password" autocomplete="new-password" :class="{ sai: loi.lai }" @input="loi.lai = ''" />
                <small v-if="loi.lai" class="loi" role="alert">{{ loi.lai }}</small></label>
            <p v-if="loi.chung" class="loi" role="alert">{{ loi.chung }}</p>
        </form>
        <template #chan>
            <button type="button" class="btn-ghost" @click="emit('dong')">Hủy</button>
            <button type="submit" form="form-mk" class="btn-primary" :disabled="dang">Đổi mật khẩu</button>
        </template>
    </HopThoai>
</template>

<style scoped>
.luoi { display: grid; gap: 14px; }
.o { display: grid; gap: 6px; }
.o > span { font-size: 13px; font-weight: 700; color: var(--c-navy); }
input { width: 100%; height: 40px; padding: 0 12px; font: inherit; color: var(--c-text); border: 1px solid var(--c-line); border-radius: 10px; background: var(--c-surface); }
input:focus { outline: 0; border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-soft); }
.sai { border-color: var(--c-off); }
.loi { margin: 0; color: var(--c-off); font-size: 12.5px; }
button[disabled] { opacity: .6; cursor: default; }
</style>
