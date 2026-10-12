<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../stores/theme';
import { LOGO_ICONS } from '../composables/logoIcons';

const props = defineProps({ size: { type: Number, default: 40 } });

const theme = useThemeStore();
const Icon = computed(() => LOGO_ICONS[theme.logo.value] || LOGO_ICONS.Store);
const laAnh = computed(() => theme.logo.type === 'image');
</script>

<template>
    <span
        class="sb-logo"
        :class="{ 'is-image': laAnh }"
        :style="{ width: props.size + 'px', height: props.size + 'px' }"
    >
        <img v-if="laAnh" :src="theme.logo.value" alt="" />
        <component :is="Icon" v-else :size="Math.round(props.size * 0.55)" />
    </span>
</template>
