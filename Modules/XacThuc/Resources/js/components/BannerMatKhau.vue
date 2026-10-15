<script setup>
import { ref } from 'vue';
import { TriangleAlert } from 'lucide-vue-next';
import { useXacThuc } from '../stores/xacThuc';
import DoiMatKhau from './DoiMatKhau.vue';

// Nhắc đổi mật khẩu khi tài khoản vẫn dùng mật khẩu mặc định.
const auth = useXacThuc();
const mo = ref(false);
</script>

<template>
    <div v-if="auth.user?.macDinh" class="canh-bao" role="status">
        <TriangleAlert :size="18" aria-hidden="true" />
        <span>Bạn đang dùng mật khẩu mặc định. Hãy đổi mật khẩu để bảo mật tài khoản.</span>
        <button type="button" class="btn-ghost" @click="mo = true">Đổi ngay</button>
        <DoiMatKhau v-if="mo" @dong="mo = false" />
    </div>
</template>

<style scoped>
.canh-bao { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 10px 28px; background: #fff7e6; color: #8a5a00; border-bottom: 1px solid #f3dca8; font-size: 14px; }
.canh-bao span { flex: 1 1 240px; }
.canh-bao .btn-ghost { height: 32px; }
@media (max-width: 860px) { .canh-bao { padding: 10px 14px; } }
</style>
