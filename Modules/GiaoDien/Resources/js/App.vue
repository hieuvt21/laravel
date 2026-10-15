<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useXacThuc } from '@modules/XacThuc/Resources/js/stores/xacThuc';

// Mất phiên (token hết hạn, bị khóa, đăng xuất ở nơi khác...): đưa về màn hình đăng nhập.
const auth = useXacThuc();
const router = useRouter();
const route = useRoute();
watch(() => auth.user, (u) => {
    if (!u && auth.daKhoiTao && !route.meta.congKhai) router.replace('/dang-nhap');
});
// Bị thu quyền khi đang đứng ở trang đó: đưa về trang đầu tiên còn được phép
watch(() => [auth.user?.quyen?.length, auth.user?.quyen?.join(',')], () => {
    const q = route.meta.quyen;
    if (auth.user && q && !auth.coQuyen(q) && auth.trangChu !== route.path) router.replace(auth.trangChu);
});
</script>

<template>
    <RouterView />
</template>
