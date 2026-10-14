import { defineStore } from 'pinia';
import { taoKho } from '@/core/kho/kho';

const kho = taoKho('nhan_vien');
const sapXep = (ds) => ds.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));

export const useNhanVienStore = defineStore('nhanVien', {
    state: () => ({ ds: [], daTai: false, loi: '' }),
    getters: {
        demTheoChucVu: (s) => (id) => s.ds.filter((n) => n.chucVuId === id).length,
    },
    actions: {
        async tai() {
            if (this.daTai) return;
            try {
                this.ds = sapXep(await kho.tatCa());
                this.daTai = true;
            } catch (e) {
                this.loi = 'Không đọc được dữ liệu nhân viên trên thiết bị này.';
                console.error(e);
            }
        },
        // data: { id?, ten, sdt, ghiChu, luongCoBan, chucVuId }
        async luu(data) {
            const doc = await kho.luu({ ...data });
            const i = this.ds.findIndex((n) => n.id === doc.id);
            if (i < 0) this.ds.push(doc); else this.ds[i] = doc;
            sapXep(this.ds);
            return doc;
        },
        async xoa(id) {
            await kho.xoa(id);
            this.ds = this.ds.filter((n) => n.id !== id);
        },
    },
});
