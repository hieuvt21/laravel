<script setup>
import { RotateCcw } from 'lucide-vue-next';
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import ThongTinCuaHang from '../components/ThongTinCuaHang.vue';
import MauChuDao from '../components/MauChuDao.vue';
import ThanhTieuDe from '../components/ThanhTieuDe.vue';
import CoChu from '../components/CoChu.vue';

const theme = useThemeStore();
</script>

<template>
    <section class="trang">
        <div class="page-head">
            <h1>Cài đặt giao diện</h1>
            <p>Thay đổi có hiệu lực ngay và được lưu trên thiết bị này.</p>
        </div>

        <div class="cac-khoi">
            <ThongTinCuaHang />
            <MauChuDao />
            <ThanhTieuDe />
            <CoChu />

            <div>
                <button type="button" class="btn-ghost" @click="theme.macDinh()">
                    <RotateCcw :size="16" />
                    Khôi phục mặc định
                </button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.trang { max-width: 760px; }
.cac-khoi { display: grid; gap: 16px; }
</style>
