<script setup>
import { useRouter } from 'vue-router';
import { ShieldOff } from 'lucide-vue-next';
import { useXacThuc } from '../stores/xacThuc';

const auth = useXacThuc();
const router = useRouter();
async function thoat() { await auth.dangXuat(); await router.replace('/dang-nhap'); }
</script>

<template>
    <main class="nen">
        <div class="card hop">
            <ShieldOff :size="36" aria-hidden="true" />
            <h1>Chưa có quyền sử dụng</h1>
            <p>Tài khoản <strong>{{ auth.user?.ten }}</strong> chưa được cấp quyền nào. Vui lòng liên hệ quản trị viên.</p>
            <button type="button" class="btn-primary" @click="thoat">Đăng xuất</button>
        </div>
    </main>
</template>

<style scoped>
.nen { min-height: 100vh; display: grid; place-items: center; padding: 20px; }
.hop { max-width: 420px; display: grid; justify-items: center; gap: 10px; text-align: center; padding: 32px; color: var(--c-muted); }
h1 { margin: 0; font-size: 20px; color: var(--c-navy); }
p { margin: 0; }
</style>
