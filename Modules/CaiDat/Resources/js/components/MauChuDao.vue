<script setup>
import { Check } from 'lucide-vue-next';
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import KhoiCaiDat from './KhoiCaiDat.vue';

const theme = useThemeStore();

const MAU = [
    { ten: 'Cam', ma: '#ff9f43' },
    { ten: 'Xanh dương', ma: '#2f80ed' },
    { ten: 'Xanh lá', ma: '#1b9e77' },
    { ten: 'Tím', ma: '#7c5cff' },
    { ten: 'Hồng', ma: '#e84a8a' },
    { ten: 'Đỏ', ma: '#e5484d' },
    { ten: 'Vàng đất', ma: '#d9a400' },
    { ten: 'Xám xanh', ma: '#475569' },
];

const dangChon = (ma) => theme.color === ma;
</script>

<template>
    <KhoiCaiDat title="Màu chủ đạo" hint="Dùng cho mục menu đang chọn, nút chính và các điểm nhấn.">
        <div class="luoi" role="radiogroup" aria-label="Màu chủ đạo">
            <button
                v-for="m in MAU"
                :key="m.ma"
                type="button"
                role="radio"
                class="o"
                :class="{ on: dangChon(m.ma) }"
                :style="{ '--o': m.ma }"
                :aria-checked="dangChon(m.ma)"
                :aria-label="m.ten"
                :title="m.ten"
                @click="theme.capNhat({ color: m.ma })"
            >
                <Check v-if="dangChon(m.ma)" :size="18" />
            </button>

            <label class="khac" title="Chọn màu khác">
                <input type="color" :value="theme.color" aria-label="Chọn màu khác" @input="theme.capNhat({ color: $event.target.value })" />
                <span>Màu khác</span>
            </label>
        </div>
        <p class="ma">Mã màu đang dùng: <b>{{ theme.color }}</b></p>
    </KhoiCaiDat>
</template>

<style scoped>
.luoi { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.o {
    width: 36px; height: 36px; border-radius: 50%; border: 0; padding: 0;
    background: var(--o); color: #fff; display: grid; place-items: center;
}
.o.on { box-shadow: 0 0 0 2px var(--c-surface), 0 0 0 4px var(--o); }
.khac { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--c-muted); cursor: pointer; }
.khac input {
    width: 36px; height: 36px; padding: 0; border: 1px solid var(--c-line); border-radius: 50%;
    background: none; cursor: pointer;
}
.khac input::-webkit-color-swatch-wrapper { padding: 0; }
.khac input::-webkit-color-swatch { border: 0; border-radius: 50%; }
.khac input::-moz-color-swatch { border: 0; border-radius: 50%; }
.ma { margin: 0; font-size: 13px; color: var(--c-muted); }
</style>
