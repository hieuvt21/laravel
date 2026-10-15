<script setup>
import { CloudAlert } from 'lucide-vue-next';
import { trangThai, xoaLoi } from '@/core/dongBo';
</script>

<template>
    <div v-if="trangThai.loi.length" class="canh-bao" role="alert">
        <CloudAlert :size="18" aria-hidden="true" />
        <span>
            <strong>{{ trangThai.loi.length === 1 ? 'Có 1 thay đổi' : `Có ${trangThai.loi.length} thay đổi` }} bị máy chủ từ chối</strong>
            và đã được hoàn lại: {{ [...new Set(trangThai.loi.map((l) => l.noiDung))].join(' · ') }}
        </span>
        <button type="button" class="btn-ghost" @click="xoaLoi()">Đã hiểu</button>
    </div>
</template>

<style scoped>
.canh-bao { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 10px 28px; background: #fdecec; color: #9b2c2c; border-bottom: 1px solid #f5c2c2; font-size: 14px; }
.canh-bao span { flex: 1 1 240px; }
.canh-bao .btn-ghost { height: 32px; }
@media (max-width: 860px) { .canh-bao { padding: 10px 14px; } }
</style>
