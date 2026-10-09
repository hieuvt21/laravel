<script setup>
import { onBeforeUnmount } from 'vue';
import { PanelLeftClose, PanelLeftOpen, Store } from 'lucide-vue-next';
import { useGiaoDienStore } from '../stores/giaoDien';
import { menuItems } from '@/core/registry';

const store = useGiaoDienStore();
let timer = null;

// Trễ nhẹ khi rời chuột để sidebar không nhấp nháy.
function vao() { clearTimeout(timer); store.setHover(true); }
function ra() { clearTimeout(timer); timer = setTimeout(() => store.setHover(false), 150); }
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <aside
        class="sidebar"
        :class="{ expanded: store.expanded, 'mobile-open': store.mobileOpen }"
        @mouseenter="vao"
        @mouseleave="ra"
    >
        <div class="sb-brand">
            <span class="sb-logo"><Store :size="22" /></span>
            <span class="sb-name sb-fade">POS Cửa hàng</span>
            <button
                class="sb-pin sb-fade"
                :class="{ on: store.pinned }"
                :title="store.pinned ? 'Bỏ cố định' : 'Cố định menu'"
                :aria-pressed="store.pinned"
                @click="store.togglePin()"
            >
                <PanelLeftClose v-if="store.pinned" :size="18" />
                <PanelLeftOpen v-else :size="18" />
            </button>
        </div>

        <nav class="sb-nav" aria-label="Menu chính">
            <RouterLink v-for="m in menuItems" :key="m.key" :to="m.to" class="sb-item" :title="m.label">
                <component :is="m.icon" :size="20" class="sb-icon" />
                <span class="sb-label sb-fade">{{ m.label }}</span>
            </RouterLink>
        </nav>
    </aside>
</template>
