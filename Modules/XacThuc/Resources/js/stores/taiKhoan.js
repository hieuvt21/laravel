import { defineStore } from 'pinia';
import { taoKho } from '@/core/kho/kho';
import { bam } from '@/core/matKhau';

const kho = taoKho('tai_khoan');
export const ID_ADMIN = 'admin';
export const MAT_KHAU_MAC_DINH = '123456';

// Tài khoản đăng nhập. loai: 'admin' | 'nhan-vien' | 'khach-hang'.
// doiTuongId: id nhân viên / khách hàng mà tài khoản thuộc về. macDinh = vẫn đang dùng mật khẩu mặc định.
export const useTaiKhoanStore = defineStore('taiKhoan', {
    state: () => ({ ds: [], daTai: false }),
    getters: {
        theoId: (s) => (id) => s.ds.find((t) => t.id === id),
        theoTen: (s) => (ten) => s.ds.find((t) => t.tenDangNhap.toLowerCase() === String(ten).trim().toLowerCase()),
        theoDoiTuong: (s) => (id) => s.ds.find((t) => t.doiTuongId === id),
    },
    actions: {
        async tai() {
            if (this.daTai) return;
            let ds = await kho.tatCa();
            if (!ds.some((t) => t.id === ID_ADMIN)) {
                ds.push(await kho.luu({ id: ID_ADMIN, tenDangNhap: 'admin', ten: 'Quản trị', loai: 'admin', matKhau: await bam(MAT_KHAU_MAC_DINH), macDinh: true, khoa: false }));
            }
            this.ds = ds;
            this.daTai = true;
        },
        tonTai(ten, boQuaId = null) {
            const t = this.theoTen(ten);
            return !!t && t.id !== boQuaId;
        },
        async luu(data) {
            const doc = await kho.luu({ ...data });
            const i = this.ds.findIndex((t) => t.id === doc.id);
            if (i < 0) this.ds.push(doc); else this.ds[i] = doc;
            return doc;
        },
        async datMatKhau(id, matKhauMoi, macDinh = false) {
            return this.luu({ ...this.theoId(id), matKhau: await bam(matKhauMoi), macDinh });
        },
        async xoa(id) {
            if (id === ID_ADMIN) return;
            await kho.xoa(id);
            this.ds = this.ds.filter((t) => t.id !== id);
        },
        async xoaTheoDoiTuong(doiTuongId) {
            const t = this.theoDoiTuong(doiTuongId);
            if (t) await this.xoa(t.id);
        },
    },
});
