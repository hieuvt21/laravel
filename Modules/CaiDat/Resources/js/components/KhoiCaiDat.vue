<script setup>
// Một khối cài đặt: tiêu đề, dòng gợi ý và phần điều khiển (slot).
defineProps({ title: String, hint: String });
</script>

<template>
    <section class="card khoi">
        <header>
            <h2>{{ title }}</h2>
            <p v-if="hint">{{ hint }}</p>
        </header>
        <slot />
    </section>
</template>

<style scoped>
.khoi { display: grid; gap: 16px; }
h2 { margin: 0; font-size: 16px; color: var(--c-navy); }
header p { margin: 2px 0 0; font-size: 13px; color: var(--c-muted); }
</style>
