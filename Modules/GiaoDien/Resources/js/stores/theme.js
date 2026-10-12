import { defineStore } from 'pinia';
import { bangMau } from '../composables/mau';
import { LOGO_ICONS } from '../composables/logoIcons';

// Cài đặt giao diện, lưu theo thiết bị (localStorage).
// Sau này cần dùng chung cho cả cửa hàng thì chỉ đổi 2 hàm doc() và ghi() sang gọi API.
const KEY = 'pos.theme.v1';

export const CO_CHU = { sm: '14px', md: '15px', lg: '17px' };

export const MAC_DINH = Object.freeze({
    color: '#ff9f43',
    storeName: 'POS Cửa hàng',
    logo: { type: 'icon', value: 'Store' },
    fontSize: 'md',
    titleBar: 'white', // 'white' | 'primary'
});

function doc() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function ghi(state) {
    try {
        localStorage.setItem(KEY, JSON.stringify(state));
        return true;
    } catch {
        return false; // đầy bộ nhớ, chế độ ẩn danh...
    }
}

// Dữ liệu đọc từ bộ nhớ có thể hỏng hoặc bị sửa tay, nên luôn làm sạch trước khi dùng.
function lamSach(raw) {
    const o = raw && typeof raw === 'object' ? raw : {};
    const out = {
        color: typeof o.color === 'string' && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color.toLowerCase() : MAC_DINH.color,
        storeName: typeof o.storeName === 'string' ? o.storeName.slice(0, 40) : MAC_DINH.storeName,
        fontSize: Object.hasOwn(CO_CHU, o.fontSize) ? o.fontSize : MAC_DINH.fontSize,
        titleBar: ['white', 'primary'].includes(o.titleBar) ? o.titleBar : MAC_DINH.titleBar,
        logo: { ...MAC_DINH.logo },
    };

    const l = o.logo;
    if (l && l.type === 'icon' && Object.hasOwn(LOGO_ICONS, l.value)) {
        out.logo = { type: 'icon', value: l.value };
    } else if (l && l.type === 'image' && typeof l.value === 'string' && l.value.startsWith('data:image/') && l.value.length < 400000) {
        out.logo = { type: 'image', value: l.value };
    }
    return out;
}

export const useThemeStore = defineStore('theme', {
    state: () => lamSach(doc()),

    actions: {
        /** Đổi một hay nhiều cài đặt. Trả về false nếu không lưu được vào bộ nhớ trình duyệt. */
        capNhat(patch) {
            this.$patch(lamSach({ ...this.$state, ...patch }));
            const daLuu = ghi(this.$state);
            this.apDung();
            return daLuu;
        },

        macDinh() {
            this.$patch(lamSach(null));
            try { localStorage.removeItem(KEY); } catch { /* bỏ qua */ }
            this.apDung();
        },

        /** Đẩy cài đặt ra giao diện: biến màu CSS, cỡ chữ, màu thanh tiêu đề, tiêu đề tab. */
        apDung() {
            const m = bangMau(this.color);
            const root = document.documentElement.style;
            root.setProperty('--c-primary', m.primary);
            root.setProperty('--c-primary-soft', m.soft);
            root.setProperty('--c-primary-ink', m.ink);
            root.setProperty('--c-on-primary', m.onPrimary);
            root.setProperty('--fs-base', CO_CHU[this.fontSize]);

            let meta = document.querySelector('meta[name="theme-color"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'theme-color';
                document.head.appendChild(meta);
            }
            meta.content = this.titleBar === 'primary' ? m.primary : '#ffffff';

            document.title = this.storeName.trim() || 'POS';
        },
    },
});
