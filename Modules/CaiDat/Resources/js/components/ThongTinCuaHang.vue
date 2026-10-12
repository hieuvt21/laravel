<script setup>
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import KhoiCaiDat from './KhoiCaiDat.vue';
import BieuTuongLogo from './BieuTuongLogo.vue';

const theme = useThemeStore();
</script>

<template>
    <KhoiCaiDat title="Cửa hàng" hint="Tên và biểu tượng hiện ở góc trên bên trái của menu.">
        <label class="truong">
            <span>Tên cửa hàng</span>
            <input
                type="text"
                maxlength="40"
                placeholder="POS Cửa hàng"
                :value="theme.storeName"
                @input="theme.capNhat({ storeName: $event.target.value })"
            />
        </label>

        <BieuTuongLogo />
    </KhoiCaiDat>
</template>

<style scoped>
.truong { display: grid; gap: 6px; max-width: 360px; font-size: 14px; font-weight: 600; }
.truong input {
    height: 40px; padding: 0 12px; font: inherit; font-weight: 400; color: var(--c-text);
    border: 1px solid var(--c-line); border-radius: 10px; background: var(--c-surface);
}
.truong input:focus { outline: none; border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-soft); }
</style>
