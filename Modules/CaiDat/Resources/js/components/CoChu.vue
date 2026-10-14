<script setup>
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import KhoiCaiDat from './KhoiCaiDat.vue';
import NhomChon from './NhomChon.vue';

const theme = useThemeStore();
const CHON = [
    { value: 'sm', label: 'Nhỏ' },
    { value: 'md', label: 'Vừa' },
    { value: 'lg', label: 'Lớn' },
];
</script>

<template>
    <KhoiCaiDat title="Cỡ chữ" hint="Nên chọn cỡ lớn khi dùng máy tính bảng hoặc màn hình nhỏ.">
        <NhomChon
            :model-value="theme.fontSize"
            :options="CHON"
            label="Cỡ chữ"
            @update:model-value="theme.capNhat({ fontSize: $event })"
        />
    </KhoiCaiDat>
</template>
