<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGiaoDienStore } from '../stores/giaoDien';
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';

const store = useGiaoDienStore();
const route = useRoute();
watch(() => route.fullPath, () => store.closeMobile());
</script>

<template>
    <div class="shell" :class="{ 'is-pinned': store.pinned }">
        <AppSidebar />
        <div class="scrim" :class="{ show: store.mobileOpen }" @click="store.closeMobile()" />
        <div class="main">
            <AppHeader />
            <main class="content">
                <RouterView />
            </main>
        </div>
    </div>
</template>
