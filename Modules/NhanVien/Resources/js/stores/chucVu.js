import { defineStore } from 'pinia';
import { taoKho } from '@/core/kho/kho';
import { tatCaQuyen } from '@/core/registry';

const kho = taoKho('chuc_vu');
export const ID_QUAN_TRI = 'quan-tri';

// Chức vụ mặc định, tạo một lần khi chưa có dữ liệu. Quản trị viên luôn có mọi quyền (kể cả quyền thêm sau này).
const MAC_DINH = [
    { id: ID_QUAN_TRI, ten: 'Quản trị viên', khoa: true, quyen: [] },
    { id: 'quan-ly', ten: 'Quản lý', quyen: tatCaQuyen.filter((k) => !['cai-dat.phan-quyen', 'nhan-vien.xem-luong'].includes(k)) },
    { id: 'ban-hang', ten: 'Bán hàng', quyen: ['ban-hang.xem', 'ban-hang.tao-don', 'ban-hang.giam-gia', 'ban-hang.xem-lich-su', 'san-pham.xem', 'dich-vu.xem', 'khach-hang.xem', 'khach-hang.them-sua', 'khach-hang.xem-lich-su'] },
    { id: 'phuc-vu', ten: 'Phục vụ', quyen: ['ban-hang.xem', 'ban-hang.tao-don', 'san-pham.xem', 'dich-vu.xem'] },
    { id: 'thu-kho', ten: 'Thủ kho', quyen: ['san-pham.xem', 'san-pham.them-sua', 'san-pham.dieu-chinh-kho'] },
];

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
                let ds = await kho.tatCa();
                if (!ds.length) ds = await Promise.all(MAC_DINH.map((c) => kho.luu(c)));
                this.ds = sapXep(ds);
                this.daTai = true;
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
