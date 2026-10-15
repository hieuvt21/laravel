<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Eye, EyeOff } from 'lucide-vue-next';
import LogoCuaHang from '@modules/GiaoDien/Resources/js/components/LogoCuaHang.vue';
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import { useXacThuc } from '../stores/xacThuc';

const auth = useXacThuc();
const theme = useThemeStore();
const route = useRoute();
const router = useRouter();

const f = reactive({ ten: '', mk: '' });
const hien = ref(false);
const loi = ref('');
const dang = ref(false);
const o_ten = ref(null);

onMounted(() => o_ten.value?.focus());

// Chỉ cho quay lại đường dẫn nội bộ (chống chuyển hướng sang trang khác)
const diaChiTiep = () => {
    const t = String(route.query.tiep ?? '');
    return t.startsWith('/') && !t.startsWith('//') ? t : null;
};

async function dangNhap() {
    if (dang.value) return;
    if (!f.ten.trim() || !f.mk) { loi.value = 'Vui lòng nhập tên đăng nhập và mật khẩu.'; return; }
    dang.value = true; loi.value = '';
    try {
        const kq = await auth.dangNhap(f.ten, f.mk);
        if (!kq.ok) { loi.value = kq.loi; f.mk = ''; return; }
        await router.replace(diaChiTiep() ?? auth.trangChu);
    } catch (e) {
        console.error(e);
        loi.value = 'Không đăng nhập được. Vui lòng thử lại.';
    } finally {
        dang.value = false;
    }
}
</script>

<template>
    <main class="nen">
        <form class="hop card" novalidate @submit.prevent="dangNhap">
            <div class="dau">
                <LogoCuaHang :size="56" />
                <h1>{{ theme.storeName || 'POS Cửa hàng' }}</h1>
                <p>Đăng nhập để tiếp tục</p>
            </div>

            <label class="o">
                <span>Tên đăng nhập</span>
                <input ref="o_ten" v-model="f.ten" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" @input="loi = ''" />
            </label>
            <label class="o">
                <span>Mật khẩu</span>
                <div class="mk">
                    <input v-model="f.mk" :type="hien ? 'text' : 'password'" autocomplete="current-password" @input="loi = ''" />
                    <button type="button" class="mat" :aria-label="hien ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="hien = !hien">
                        <EyeOff v-if="hien" :size="18" /><Eye v-else :size="18" />
                    </button>
                </div>
            </label>

            <p v-if="auth.thongBao && !loi" class="tb" role="status">{{ auth.thongBao }}</p>
            <p v-if="loi" class="loi" role="alert">{{ loi }}</p>
            <button type="submit" class="btn-primary vao" :disabled="dang">{{ dang ? 'Đang kiểm tra…' : 'Đăng nhập' }}</button>
        </form>
    </main>
</template>

<style scoped>
.nen { min-height: 100vh; display: grid; place-items: center; padding: 20px; background: var(--c-bg); }
.hop { width: 100%; max-width: 400px; padding: 28px; display: grid; gap: 16px; box-shadow: 0 12px 40px rgba(15, 42, 71, .08); }
.dau { display: grid; justify-items: center; gap: 6px; text-align: center; margin-bottom: 4px; }
.dau h1 { margin: 8px 0 0; font-size: 22px; color: var(--c-navy); }
.dau p { margin: 0; color: var(--c-muted); }
.o { display: grid; gap: 6px; }
.o > span { font-size: 13px; font-weight: 700; color: var(--c-navy); }
input { width: 100%; height: 44px; padding: 0 12px; font: inherit; color: var(--c-text); border: 1px solid var(--c-line); border-radius: 10px; background: var(--c-surface); }
input:focus { outline: 0; border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-soft); }
.mk { position: relative; }
.mk input { padding-right: 44px; }
.mat { position: absolute; right: 4px; top: 4px; width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--c-muted); }
.mat:hover { color: var(--c-text); background: var(--c-bg); }
.loi { margin: 0; color: var(--c-off); font-size: 13.5px; }
.tb { margin: 0; padding: 8px 12px; border-radius: 10px; background: #fff7e6; color: #8a5a00; font-size: 13.5px; }
.vao { justify-content: center; height: 44px; }
.vao[disabled] { opacity: .7; cursor: default; }
</style>
