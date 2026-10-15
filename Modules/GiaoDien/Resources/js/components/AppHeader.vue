<script setup>
import { computed } from 'vue';
import { Menu, Search, Bell, Maximize, ShoppingCart } from 'lucide-vue-next';
import { trangThai } from '@/core/dongBo';
import { useGiaoDienStore } from '../stores/giaoDien';
import { useOnline } from '../composables/useOnline';
import { useXacThuc } from '@modules/XacThuc/Resources/js/stores/xacThuc';
import MenuNguoiDung from '@modules/XacThuc/Resources/js/components/MenuNguoiDung.vue';

const store = useGiaoDienStore();
const { online } = useOnline();
const auth = useXacThuc();
// Trạng thái kết nối + đồng bộ hiển thị ở header
const net = computed(() => {
    const cho = trangThai.soCho;
    if (!online.value) return { lop: 'off', chu: cho ? `Ngoại tuyến · ${cho} chờ gửi` : 'Ngoại tuyến' };
    if (trangThai.canDangNhapLai) return { lop: 'wait', chu: 'Cần đăng nhập lại để đồng bộ' };
    if (trangThai.dangChay && cho) return { lop: 'wait', chu: 'Đang đồng bộ…' };
    if (cho) return { lop: 'wait', chu: `Chờ gửi ${cho}` };
    if (trangThai.loiMang) return { lop: 'wait', chu: 'Chưa kết nối được máy chủ' };
    return { lop: 'ok', chu: 'Đã đồng bộ' };
});

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
            <span class="net" :class="net.lop" role="status"><i /> {{ net.chu }}</span>
            <RouterLink v-if="auth.coQuyen('ban-hang.xem')" to="/ban-hang" class="btn-primary">
                <ShoppingCart :size="16" /> Bán hàng
            </RouterLink>
            <button class="icon-btn" aria-label="Toàn màn hình" @click="toanManHinh"><Maximize :size="18" /></button>
            <button class="icon-btn" aria-label="Thông báo"><Bell :size="18" /></button>
            <MenuNguoiDung />
        </div>
    </header>
</template>
