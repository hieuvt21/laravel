<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { KeyRound, LogOut } from 'lucide-vue-next';
import { useXacThuc } from '../stores/xacThuc';
import DoiMatKhau from './DoiMatKhau.vue';

// Ảnh đại diện ở header: bấm mở menu Đổi mật khẩu / Đăng xuất.
const auth = useXacThuc();
const router = useRouter();
const mo = ref(false);
const doiMk = ref(false);
const goc = ref(null);

const chuCai = computed(() => (auth.user?.ten ?? '?').trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase());
const ngoai = (e) => { if (mo.value && !goc.value?.contains(e.target)) mo.value = false; };
const phim = (e) => { if (e.key === 'Escape') mo.value = false; };
onMounted(() => { document.addEventListener('pointerdown', ngoai); document.addEventListener('keydown', phim); });
onBeforeUnmount(() => { document.removeEventListener('pointerdown', ngoai); document.removeEventListener('keydown', phim); });

async function thoat() {
    mo.value = false;
    await auth.dangXuat();
    await router.replace('/dang-nhap');
}
</script>

<template>
    <div ref="goc" class="nd">
        <button type="button" class="avatar" :aria-expanded="mo" aria-haspopup="menu" :title="auth.user?.ten" @click="mo = !mo">{{ chuCai }}</button>
        <div v-if="mo" class="menu" role="menu">
            <div class="tt">
                <strong>{{ auth.user?.ten }}</strong>
                <small>{{ auth.user?.chucVu || 'Khách hàng' }}</small>
            </div>
            <button type="button" role="menuitem" @click="mo = false; doiMk = true"><KeyRound :size="16" /> Đổi mật khẩu</button>
            <button type="button" role="menuitem" @click="thoat"><LogOut :size="16" /> Đăng xuất</button>
        </div>
        <DoiMatKhau v-if="doiMk" @dong="doiMk = false" />
    </div>
</template>

<style scoped>
.nd { position: relative; }
.avatar { border: 0; }
.menu { position: absolute; right: 0; top: calc(100% + 8px); z-index: 60; min-width: 220px; padding: 6px; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 12px; box-shadow: 0 12px 32px rgba(15, 42, 71, .16); display: grid; gap: 2px; }
.tt { display: grid; padding: 8px 10px 10px; border-bottom: 1px solid var(--c-line); margin-bottom: 4px; }
.tt small { color: var(--c-muted); }
.menu button { display: flex; align-items: center; gap: 10px; height: 38px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent; color: var(--c-text); text-align: left; }
.menu button:hover { background: var(--c-bg); }
</style>
