<script setup>
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import KhoiCaiDat from './KhoiCaiDat.vue';
import NhomChon from './NhomChon.vue';

const theme = useThemeStore();
const CHON = [
    { value: 'white', label: 'Trắng' },
    { value: 'primary', label: 'Theo màu chủ đạo' },
];
</script>

<template>
    <KhoiCaiDat title="Thanh tiêu đề" hint="Màu thanh tiêu đề của cửa sổ app (khi đã cài app lên máy).">
        <NhomChon
            :model-value="theme.titleBar"
            :options="CHON"
            label="Màu thanh tiêu đề"
            @update:model-value="theme.capNhat({ titleBar: $event })"
        />
    </KhoiCaiDat>
</template>
