import { defineStore } from 'pinia';

const KEY = 'pos.sidebar.pinned';
let timerRa = null;

function docTrangThaiGhim() {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

export const useGiaoDienStore = defineStore('giaoDien', {
    state: () => ({
        pinned: docTrangThaiGhim(), // cố định trạng thái mở
        hovering: false,            // đang rê chuột vào sidebar
        mobileOpen: false,          // ngăn kéo trên điện thoại
    }),
    getters: {
        expanded: (s) => s.pinned || s.hovering,
    },
    actions: {
        togglePin() {
            this.pinned = !this.pinned;
            try { localStorage.setItem(KEY, this.pinned ? '1' : '0'); } catch {}
        },
        setHover(v) { this.hovering = v; },
        // Dùng chung cho sidebar và bảng menu phụ nổi: chuột còn nằm ở một trong hai thì sidebar giữ nguyên trạng thái mở.
        vaoSidebar() { clearTimeout(timerRa); this.hovering = true; },
        raSidebar() { clearTimeout(timerRa); timerRa = setTimeout(() => { this.hovering = false; }, 150); },
        toggleMobile() { this.mobileOpen = !this.mobileOpen; },
        closeMobile() { this.mobileOpen = false; },
    },
});
