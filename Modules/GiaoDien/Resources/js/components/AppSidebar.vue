<script setup>
<<<<<<< HEAD
=======
import { onBeforeUnmount } from 'vue';
>>>>>>> cfa7866d84281c11476defc1cf8e1f4804991acc
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next';
import { useGiaoDienStore } from '../stores/giaoDien';
import { useThemeStore } from '../stores/theme';
import { menuItems } from '@/core/registry';
import LogoCuaHang from './LogoCuaHang.vue';
import SidebarGroup from './SidebarGroup.vue';

const store = useGiaoDienStore();
const theme = useThemeStore();
<<<<<<< HEAD
=======
let timer = null;

// Trễ nhẹ khi rời chuột để sidebar không nhấp nháy.
function vao() { clearTimeout(timer); store.setHover(true); }
function ra() { clearTimeout(timer); timer = setTimeout(() => store.setHover(false), 150); }
onBeforeUnmount(() => clearTimeout(timer));
>>>>>>> cfa7866d84281c11476defc1cf8e1f4804991acc
</script>

<template>
    <aside
        class="sidebar"
        :class="{ expanded: store.expanded, 'mobile-open': store.mobileOpen }"
        @mouseenter="store.vaoSidebar()"
        @mouseleave="store.raSidebar()"
    >
        <div class="sb-brand">
            <LogoCuaHang />
            <span class="sb-name sb-fade" :title="theme.storeName">{{ theme.storeName || 'POS' }}</span>
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
            <template v-for="m in menuItems" :key="m.key">
                <SidebarGroup v-if="m.children" :item="m" />
                <RouterLink v-else :to="m.to" class="sb-item" :title="m.label">
                    <component :is="m.icon" :size="20" class="sb-icon" />
                    <span class="sb-label sb-fade">{{ m.label }}</span>
                </RouterLink>
            </template>
        </nav>
    </aside>
</template>
