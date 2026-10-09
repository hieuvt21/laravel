<script setup>
import { Menu, Search, Bell, Maximize, ShoppingCart } from 'lucide-vue-next';
import { useGiaoDienStore } from '../stores/giaoDien';
import { useOnline } from '../composables/useOnline';

const store = useGiaoDienStore();
const { online } = useOnline();

function toanManHinh() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
}
</script>

<template>
    <header class="header">
        <button class="icon-btn only-mobile" aria-label="Mở menu" @click="store.toggleMobile()">
            <Menu :size="20" />
        </button>

        <label class="search">
            <Search :size="16" />
            <input type="search" placeholder="Tìm sản phẩm, khách hàng, đơn hàng…" />
        </label>

        <div class="header-right">
            <span class="net" :class="online ? 'ok' : 'off'">
                <i /> {{ online ? 'Trực tuyến' : 'Ngoại tuyến' }}
            </span>
            <RouterLink to="/ban-hang" class="btn-primary">
                <ShoppingCart :size="16" /> Bán hàng
            </RouterLink>
            <button class="icon-btn" aria-label="Toàn màn hình" @click="toanManHinh"><Maximize :size="18" /></button>
            <button class="icon-btn" aria-label="Thông báo"><Bell :size="18" /></button>
            <span class="avatar" title="Quản trị">QT</span>
        </div>
    </header>
</template>
