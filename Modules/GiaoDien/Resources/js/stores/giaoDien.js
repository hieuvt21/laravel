import { defineStore } from 'pinia';

const KEY = 'pos.sidebar.pinned';

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
        toggleMobile() { this.mobileOpen = !this.mobileOpen; },
        closeMobile() { this.mobileOpen = false; },
    },
});
