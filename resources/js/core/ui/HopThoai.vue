<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { X } from 'lucide-vue-next';

// Hộp thoại dùng chung: đóng bằng Esc / bấm nền / nút X. Nội dung qua slot, nút dưới cùng qua slot "chan".
const props = defineProps({ tieuDe: String, rong: { type: Number, default: 520 } });
const emit = defineEmits(['dong']);
const hop = ref(null);
const truoc = document.activeElement;

function phim(e) {
    if (e.key === 'Escape') { e.stopPropagation(); emit('dong'); return; }
    if (e.key !== 'Tab') return;
    // Giữ focus trong hộp thoại
    const ds = [...hop.value.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
    if (!ds.length) return;
    const dau = ds[0], cuoi = ds[ds.length - 1];
    if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); }
    else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); }
}
onMounted(async () => {
    document.addEventListener('keydown', phim, true);
    await nextTick();
    (hop.value.querySelector('[autofocus], input, select, textarea') ?? hop.value.querySelector('button'))?.focus();
});
onBeforeUnmount(() => {
    document.removeEventListener('keydown', phim, true);
    truoc?.focus?.();
});
</script>

<template>
    <Teleport to="body">
        <div class="ht-nen" @pointerdown.self="emit('dong')">
            <div ref="hop" class="ht" role="dialog" aria-modal="true" :aria-label="tieuDe" :style="{ maxWidth: props.rong + 'px' }">
                <header class="ht-dau">
                    <h2>{{ tieuDe }}</h2>
                    <button type="button" class="ht-x" aria-label="Đóng" @click="emit('dong')"><X :size="18" /></button>
                </header>
                <div class="ht-than"><slot /></div>
                <footer v-if="$slots.chan" class="ht-chan"><slot name="chan" /></footer>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.ht-nen {
    position: fixed; inset: 0; z-index: 80; padding: 16px;
    display: grid; place-items: center;
    background: rgba(15, 42, 71, .4);
}
.ht {
    width: 100%; max-height: calc(100vh - 32px);
    display: flex; flex-direction: column;
    background: var(--c-surface); border-radius: 14px;
    box-shadow: 0 20px 60px rgba(15, 42, 71, .3);
}
.ht-dau { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--c-line); }
.ht-dau h2 { margin: 0; font-size: 17px; color: var(--c-navy); }
.ht-x { width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--c-muted); }
.ht-x:hover { background: var(--c-bg); color: var(--c-text); }
.ht-than { padding: 20px; overflow-y: auto; }
.ht-chan { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--c-line); }
</style>
