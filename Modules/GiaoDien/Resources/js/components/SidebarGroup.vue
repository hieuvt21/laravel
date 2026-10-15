<script>
// Loại thiết bị trỏ gần nhất (mouse / touch / pen), dùng chung cho mọi mục. Cảm ứng sinh thêm các sự kiện chuột "giả"
// (mouseenter/leave) ngay sau khi chạm; nếu để chúng đóng bảng thì bảng biến mất trước khi cú chạm kịp bấm vào mục.
let loaiCon = 'mouse';
if (typeof document !== 'undefined') {
    ['pointerdown', 'pointermove'].forEach((t) => document.addEventListener(t, (e) => { loaiCon = e.pointerType; }, true));
}
</script>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import { useGiaoDienStore } from '../stores/giaoDien';
import { useDiDong } from '../composables/useDiDong';

// Mục menu chính có menu phụ.
// - Máy tính: rê chuột/bấm -> bảng menu phụ tối màu nổi bên phải sidebar (kiểu WordPress).
// - Điện thoại (<= 860px): menu xổ xuống trong ngăn kéo như cũ.
const props = defineProps({ item: { type: Object, required: true } });

const store = useGiaoDienStore();
const route = useRoute();
const { laDiDong } = useDiDong();
const subId = `sb-sub-${props.item.key}`;

const dangChon = computed(() =>
    props.item.children.some((c) => route.path === c.to || route.path.startsWith(c.to + '/')),
);

const mo = ref(dangChon.value && laDiDong.value); // accordion (điện thoại)
const nổi = ref(false);                            // bảng nổi (máy tính)
const nut = ref(null);
const bang = ref(null);
const viTri = ref({ top: 0, left: 0 });
let timerDong = null;

watch(dangChon, (v) => { if (v && laDiDong.value) mo.value = true; });

function tinhViTri() {
    const r = nut.value.getBoundingClientRect();
    // Sidebar còn đang trượt rộng ra: lấy bề rộng đích từ biến CSS thay vì đo giữa chừng
    const cs = getComputedStyle(document.documentElement);
    const rong = parseFloat(cs.getPropertyValue(store.expanded ? '--sb-w-open' : '--sb-w')) || 76;
    const cao = bang.value?.offsetHeight ?? props.item.children.length * 40 + 12;
    const top = Math.max(8, Math.min(r.top, window.innerHeight - cao - 8));
    viTri.value = { top, left: rong };
}

async function moBang() {
    clearTimeout(timerDong);
    if (nổi.value) return;
    nổi.value = true;
    await nextTick();
    tinhViTri();
}
function dongBang(trVe = false) {
    clearTimeout(timerDong);
    if (!nổi.value) return;
    nổi.value = false;
    // Bảng biến mất khi con trỏ đang nằm trên nó thì sẽ không có sự kiện "rời": tự trả sidebar về trạng thái thu nhỏ
    if (!document.querySelector('.sidebar:hover')) store.raSidebar();
    if (trVe) nut.value?.focus();
}
function hen() { clearTimeout(timerDong); timerDong = setTimeout(() => dongBang(), 250); }

function bamNut(e) {
    if (laDiDong.value) { mo.value = !mo.value; return; }
    if (nổi.value && e.detail !== 0 && loaiCon !== 'mouse') { dongBang(); return; } // chạm lần 2 (cảm ứng): đóng; chuột đã mở sẵn khi rê vào thì giữ nguyên
    moBang().then(() => {
        if (e.detail === 0) bang.value?.querySelector('a')?.focus(); // bàn phím: vào mục đầu
    });
}
function vaoNut(e) { if (!laDiDong.value && e.pointerType === 'mouse') { store.vaoSidebar(); moBang(); } }
function raNut(e) { if (!laDiDong.value && e.pointerType === 'mouse') hen(); }
function vaoBang() { if (loaiCon !== 'mouse') return; clearTimeout(timerDong); store.vaoSidebar(); }
function raBang() { if (loaiCon !== 'mouse') return; store.raSidebar(); hen(); }

function ngoai(e) {
    if (!nổi.value) return;
    if (nut.value?.contains(e.target) || bang.value?.contains(e.target)) return;
    dongBang();
}
function phim(e) { if (e.key === 'Escape' && nổi.value) { e.preventDefault(); dongBang(true); } }
function doiKichThuoc() { if (nổi.value) tinhViTri(); }

onMounted(() => {
    document.addEventListener('pointerdown', ngoai);
    document.addEventListener('keydown', phim);
    window.addEventListener('resize', doiKichThuoc);
});
onBeforeUnmount(() => {
    clearTimeout(timerDong);
    document.removeEventListener('pointerdown', ngoai);
    document.removeEventListener('keydown', phim);
    window.removeEventListener('resize', doiKichThuoc);
});

watch(() => route.fullPath, () => dongBang());
watch(laDiDong, () => { nổi.value = false; mo.value = dangChon.value && laDiDong.value; });
// Sidebar thu lại (chuột đã rời hẳn) thì bảng nổi cũng đóng; khi ghim thì giữ vị trí đúng
watch(() => store.expanded, (v, cu) => { if (v !== cu && nổi.value) nextTick(tinhViTri); });
</script>

<template>
    <div class="sb-group" :class="{ open: mo && laDiDong, flyout: !laDiDong }">
        <button
            ref="nut"
            type="button"
            class="sb-item sb-parent"
            :class="{ 'router-link-active': dangChon, 'is-open': nổi }"
            :title="item.label"
            :aria-expanded="laDiDong ? mo : nổi"
            :aria-haspopup="laDiDong ? undefined : 'true'"
            :aria-controls="subId"
            @click="bamNut"
            @pointerenter="vaoNut"
            @pointerleave="raNut"
        >
            <component :is="item.icon" :size="20" class="sb-icon" />
            <span class="sb-label sb-fade">{{ item.label }}</span>
            <ChevronRight v-if="!laDiDong" :size="16" class="sb-chevron sb-fade" aria-hidden="true" />
            <ChevronDown v-else :size="16" class="sb-chevron sb-fade" aria-hidden="true" />
        </button>

        <!-- Điện thoại: xổ xuống -->
        <div v-if="laDiDong" :id="subId" class="sb-sub-wrap">
            <div class="sb-sub">
                <RouterLink v-for="c in item.children" :key="c.to" :to="c.to" class="sb-sub-item">
                    {{ c.label }}
                </RouterLink>
            </div>
        </div>

        <!-- Máy tính: bảng nổi -->
        <Teleport v-else to="body">
            <Transition name="flyout">
                <nav
                    v-if="nổi"
                    :id="subId"
                    ref="bang"
                    class="sb-flyout"
                    :aria-label="item.label"
                    :style="{ top: viTri.top + 'px', left: viTri.left + 'px' }"
                    @mouseenter="vaoBang"
                    @mouseleave="raBang"
                >
                    <div class="sb-flyout-title">{{ item.label }}</div>
                    <RouterLink v-for="c in item.children" :key="c.to" :to="c.to" class="sb-flyout-item">
                        {{ c.label }}
                    </RouterLink>
                </nav>
            </Transition>
        </Teleport>
    </div>
</template>
