<script setup>
import { useRouter } from 'vue-router';
import { CalendarClock, History, LogOut } from 'lucide-vue-next';
import LogoCuaHang from '@modules/GiaoDien/Resources/js/components/LogoCuaHang.vue';
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import { useXacThuc } from '@modules/XacThuc/Resources/js/stores/xacThuc';

const auth = useXacThuc();
const theme = useThemeStore();
const router = useRouter();
async function thoat() { await auth.dangXuat(); await router.replace('/dang-nhap'); }
</script>

<template>
    <div class="trang">
        <header class="dau">
            <LogoCuaHang :size="36" />
            <strong>{{ theme.storeName || 'POS Cửa hàng' }}</strong>
            <span class="ten">{{ auth.user?.ten }}</span>
            <button type="button" class="btn-ghost" @click="thoat"><LogOut :size="16" /> Đăng xuất</button>
        </header>
        <main class="noi-dung">
            <h1>Xin chào, {{ auth.user?.ten }}</h1>
            <p class="phu">Trang riêng của khách hàng đang được xây dựng.</p>
            <div class="luoi">
                <section class="card"><History :size="24" /><h2>Lịch sử mua hàng</h2><p>Sắp ra mắt</p></section>
                <section class="card"><CalendarClock :size="24" /><h2>Đặt lịch</h2><p>Sắp ra mắt</p></section>
            </div>
        </main>
    </div>
</template>

<style scoped>
.trang { min-height: 100vh; }
.dau { display: flex; align-items: center; gap: 12px; height: var(--header-h); padding: 0 24px; background: var(--c-surface); border-bottom: 1px solid var(--c-line); }
.dau strong { color: var(--c-navy); }
.ten { margin-left: auto; color: var(--c-muted); }
.noi-dung { max-width: 900px; margin: 0 auto; padding: 28px 20px; }
h1 { margin: 0 0 4px; font-size: 24px; color: var(--c-navy); }
.phu { margin: 0 0 20px; color: var(--c-muted); }
.luoi { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.card { display: grid; gap: 6px; color: var(--c-muted); }
.card h2 { margin: 4px 0 0; font-size: 16px; color: var(--c-navy); }
.card p { margin: 0; }
@media (max-width: 480px) { .ten { display: none; } .dau { padding: 0 14px; } .dau .btn-ghost { margin-left: auto; } }
</style>
