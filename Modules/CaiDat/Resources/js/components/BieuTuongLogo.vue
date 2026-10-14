<script setup>
import { ref } from 'vue';
import { ImageUp, Undo2 } from 'lucide-vue-next';
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import { LOGO_ICONS } from '@modules/GiaoDien/Resources/js/composables/logoIcons';
import LogoCuaHang from '@modules/GiaoDien/Resources/js/components/LogoCuaHang.vue';
import { thuNhoAnh } from '../composables/thuNhoAnh';

const theme = useThemeStore();
const loi = ref('');

const dangChon = (ten) => theme.logo.type === 'icon' && theme.logo.value === ten;

async function chonAnh(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // cho phép chọn lại cùng một file
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        loi.value = 'Hãy chọn file ảnh (PNG, JPG, WebP hoặc SVG).';
        return;
    }
    if (file.size > 3 * 1024 * 1024) {
        loi.value = 'Ảnh lớn hơn 3 MB. Hãy chọn ảnh nhỏ hơn.';
        return;
    }

    try {
        const anh = await thuNhoAnh(file, 128);
        loi.value = theme.capNhat({ logo: { type: 'image', value: anh } })
            ? ''
            : 'Không lưu được ảnh vào bộ nhớ của trình duyệt trên máy này.';
    } catch {
        loi.value = 'Không đọc được ảnh này. Hãy thử file khác.';
    }
}

function dungBieuTuong() {
    loi.value = '';
    theme.capNhat({ logo: { type: 'icon', value: 'Store' } });
}
</script>

<template>
    <div class="logo">
        <span class="nhan">Biểu tượng</span>

        <div class="hang">
            <LogoCuaHang :size="56" />

            <div class="luoi" role="radiogroup" aria-label="Biểu tượng có sẵn">
                <button
                    v-for="(Icon, ten) in LOGO_ICONS"
                    :key="ten"
                    type="button"
                    role="radio"
                    :class="{ on: dangChon(ten) }"
                    :aria-checked="dangChon(ten)"
                    :aria-label="ten"
                    :title="ten"
                    @click="theme.capNhat({ logo: { type: 'icon', value: ten } })"
                >
                    <component :is="Icon" :size="20" />
                </button>
            </div>
        </div>

        <div class="tai-len">
            <label class="btn-ghost chon-file">
                <ImageUp :size="16" />
                Tải ảnh logo
                <input class="sr-only" type="file" accept="image/*" @change="chonAnh" />
            </label>
            <button v-if="theme.logo.type === 'image'" type="button" class="btn-ghost" @click="dungBieuTuong">
                <Undo2 :size="16" />
                Dùng biểu tượng có sẵn
            </button>
        </div>

        <p v-if="loi" class="loi" role="alert">{{ loi }}</p>
        <p class="goi-y">Ảnh được thu nhỏ về tối đa 128 px và lưu trên thiết bị này. Nên dùng ảnh vuông, nền trong suốt.</p>
    </div>
</template>

<style scoped>
.logo { display: grid; gap: 12px; }
.nhan { font-size: 14px; font-weight: 600; }
.hang { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.luoi { display: flex; flex-wrap: wrap; gap: 8px; }
.luoi button {
    width: 40px; height: 40px; display: grid; place-items: center;
    border: 1px solid var(--c-line); border-radius: 10px; background: var(--c-surface); color: var(--c-muted);
}
.luoi button:hover { color: var(--c-text); background: var(--c-bg); }
.luoi button.on { background: var(--c-primary-soft); color: var(--c-primary-ink); border-color: var(--c-primary); }
.tai-len { display: flex; flex-wrap: wrap; gap: 10px; }
.chon-file:focus-within { outline: 2px solid var(--c-primary); outline-offset: 2px; }
.loi { margin: 0; font-size: 13px; color: var(--c-off); }
.goi-y { margin: 0; font-size: 13px; color: var(--c-muted); }
</style>
