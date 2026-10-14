<script setup>
// Nhóm nút chọn một trong vài giá trị (dạng thanh gạt).
defineProps({
    modelValue: String,
    options: { type: Array, required: true }, // [{ value, label }]
    label: String,
});
defineEmits(['update:modelValue']);
</script>

<template>
    <div class="nhom" role="radiogroup" :aria-label="label">
        <button
            v-for="o in options"
            :key="o.value"
            type="button"
            role="radio"
            :aria-checked="modelValue === o.value"
            :class="{ on: modelValue === o.value }"
            @click="$emit('update:modelValue', o.value)"
        >
            {{ o.label }}
        </button>
    </div>
</template>

<style scoped>
.nhom {
    display: inline-flex; flex-wrap: wrap; gap: 3px; padding: 3px; justify-self: start;
    border: 1px solid var(--c-line); border-radius: 12px; background: var(--c-bg);
}
button { border: 0; background: transparent; padding: 8px 16px; border-radius: 9px; color: var(--c-muted); font-weight: 600; }
button:hover { color: var(--c-text); }
button.on { background: var(--c-surface); color: var(--c-primary-ink); box-shadow: 0 1px 3px rgba(15, 42, 71, .12); }
</style>
