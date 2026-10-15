import { defineStore } from 'pinia';
import { taoKhoDongBo } from '@/core/kho/khoDongBo';
import { khiThayDoi } from '@/core/dongBo';
import { tatCaQuyen } from '@/core/registry';

const kho = taoKhoDongBo('chuc_vu'); // chức vụ mặc định do server tạo sẵn
export const ID_QUAN_TRI = 'quan-tri';

const sapXep = (ds) => ds.sort((a, b) => (b.khoa ? 1 : 0) - (a.khoa ? 1 : 0) || a.ten.localeCompare(b.ten, 'vi'));

export const useChucVuStore = defineStore('chucVu', {
    state: () => ({ ds: [], daTai: false, loi: '' }),
    getters: {
        theoId: (s) => (id) => s.ds.find((c) => c.id === id),
        // Quyền thực tế của một chức vụ (Quản trị viên = tất cả)
        quyenCua: (s) => (id) => {
            const c = s.ds.find((x) => x.id === id);
            if (!c) return [];
            return c.khoa ? tatCaQuyen : c.quyen.filter((k) => tatCaQuyen.includes(k));
        },
    },
    actions: {
        async tai() {
            if (this.daTai) return;
            try {
                this.ds = sapXep(await kho.tatCa());
                this.daTai = true;
                khiThayDoi('chuc_vu', async () => { this.ds = sapXep(await kho.tatCa()); }); // dữ liệu mới từ server
            } catch (e) {
                this.loi = 'Không đọc được dữ liệu chức vụ trên thiết bị này.';
                console.error(e);
            }
        },
        async luu(data) {
            const doc = await kho.luu({ ...data });
            const i = this.ds.findIndex((c) => c.id === doc.id);
            if (i < 0) this.ds.push(doc); else this.ds[i] = doc;
            sapXep(this.ds);
            return doc;
        },
        async xoa(id) {
            if (this.theoId(id)?.khoa) return;
            await kho.xoa(id);
            this.ds = this.ds.filter((c) => c.id !== id);
        },
    },
});
