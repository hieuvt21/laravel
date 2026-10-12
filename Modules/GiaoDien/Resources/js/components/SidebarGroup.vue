<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronDown } from 'lucide-vue-next';

// Một mục menu chính có menu phụ. Bấm để mở/đóng, mũi tên xoay theo trạng thái.
const props = defineProps({ item: { type: Object, required: true } });

const route = useRoute();
const subId = `sb-sub-${props.item.key}`;

// Mục chính được tô nổi khi đang ở một trang con của nó
const dangChon = computed(() =>
    props.item.children.some((c) => route.path === c.to || route.path.startsWith(c.to + '/')),
);

const mo = ref(dangChon.value);
watch(dangChon, (v) => { if (v) mo.value = true; });
</script>

<template>
    <div class="sb-group" :class="{ open: mo }">
        <button
            type="button"
            class="sb-item sb-parent"
            :class="{ 'router-link-active': dangChon }"
            :title="item.label"
            :aria-expanded="mo"
            :aria-controls="subId"
            @click="mo = !mo"
        >
            <component :is="item.icon" :size="20" class="sb-icon" />
            <span class="sb-label sb-fade">{{ item.label }}</span>
            <ChevronDown :size="16" class="sb-chevron sb-fade" aria-hidden="true" />
        </button>

        <div :id="subId" class="sb-sub-wrap">
            <div class="sb-sub">
                <RouterLink v-for="c in item.children" :key="c.to" :to="c.to" class="sb-sub-item">
                    {{ c.label }}
                </RouterLink>
            </div>
        </div>
    </div>
</template>
