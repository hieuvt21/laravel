import { defineStore } from 'pinia';
import { goi, caiApi, ApiLoi } from '@/core/api';
import { batDauDongBo, caiDongBo, dongBoNgay, dungDongBo } from '@/core/dongBo';
import { taoKho } from '@/core/kho/kho';
import { bam, kiemTra } from '@/core/matKhau';
import { menuChoQuyen, tatCaQuyen, trangDauTien } from '@/core/registry';

// Phiên đăng nhập. Đăng nhập và phân quyền do SERVER quyết định (token). Máy này chỉ nhớ:
//  - token + thông tin người dùng (localStorage) để mở lại app không phải đăng nhập lại;
//  - "dấu xác minh" mật khẩu của những người đã từng đăng nhập thành công trên máy (IndexedDB), để vẫn đăng nhập được khi mất mạng.
const KEY_PHIEN = 'pos.phien.v2';
const KEY_KHOA = 'pos.dn.khoa';
const luuLS = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* bỏ qua */ } };
const docLS = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const xacMinh = taoKho('dang_nhap_cuc_bo');
const tenThietBi = () => (globalThis.navigator?.userAgent ?? 'thiet-bi').slice(0, 100);
let matKhauTam = null; // chỉ giữ trong RAM sau khi đăng nhập offline, để lấy token khi có mạng trở lại

export const useXacThuc = defineStore('xacThuc', {
    state: () => ({
        token: null,
        nguoiDung: null,
        daKhoiTao: false,
        soLanSai: 0,
        khoaDen: Number(docLS(KEY_KHOA)) || 0,
        thongBao: '',
    }),
    getters: {
        user: (s) => (s.nguoiDung ? { ...s.nguoiDung, quyen: s.nguoiDung.quyen.includes('*') ? tatCaQuyen : s.nguoiDung.quyen } : null),
        taiKhoanId: (s) => s.nguoiDung?.taiKhoanId ?? null,
        coQuyen() { const q = this.user?.quyen; return (k) => !k || !!q?.includes(k); },
        trangChu() {
            if (this.user?.loai === 'khach-hang') return '/tai-khoan';
            return trangDauTien(menuChoQuyen(this.coQuyen)) ?? '/khong-co-quyen';
        },
    },
    actions: {
        // Chạy một lần khi mở app: khôi phục phiên cũ (không chờ mạng).
        async khoiTao() {
            if (this.daKhoiTao) return;
            caiApi({ layToken: () => this.token, khiHetPhien: () => this.hetPhien() });
            caiDongBo({
                layTaiKhoanId: () => this.taiKhoanId,
                layToken: () => this.token,
                thuDangNhapLai: () => this.thuLayToken(),
                khiNguoiDungDoi: (nd) => this.capNhatNguoiDung(nd),
            });
            try {
                const p = JSON.parse(docLS(KEY_PHIEN) ?? 'null');
                if (p?.nguoiDung?.taiKhoanId) { this.token = p.token ?? null; this.nguoiDung = p.nguoiDung; }
            } catch { /* phiên hỏng: bỏ qua */ }
            this.daKhoiTao = true;
            if (this.nguoiDung) batDauDongBo();
        },
        luuPhien() {
            luuLS(KEY_PHIEN, this.nguoiDung ? JSON.stringify({ token: this.token, nguoiDung: this.nguoiDung }) : null);
        },
        datPhien(token, nguoiDung) {
            this.token = token; this.nguoiDung = nguoiDung; this.thongBao = '';
            this.luuPhien();
            batDauDongBo();
        },
        capNhatNguoiDung(nd) {
            if (!nd || nd.taiKhoanId !== this.taiKhoanId || JSON.stringify(nd) === JSON.stringify(this.nguoiDung)) return;
            this.nguoiDung = nd;
            this.luuPhien();
            xacMinh.lay(String(nd.tenDangNhap).toLowerCase()).then((b) => b && xacMinh.luu({ ...b, nguoiDung: nd }));
        },

        async dangNhap(ten, matKhau) {
            await this.khoiTao();
            const bayGio = Date.now();
            if (this.khoaDen > bayGio) return { ok: false, loi: `Nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil((this.khoaDen - bayGio) / 1000)} giây.` };
            try {
                const kq = await goi('POST', '/api/dang-nhap', { tenDangNhap: ten.trim(), matKhau, thietBi: tenThietBi() });
                await xacMinh.luu({ id: ten.trim().toLowerCase(), matKhauBam: await bam(matKhau), nguoiDung: kq.nguoiDung });
                this.datPhien(kq.token, kq.nguoiDung);
                return { ok: true };
            } catch (e) {
                if (e instanceof ApiLoi && e.mang) return this.dangNhapOffline(ten, matKhau);
                if (e instanceof ApiLoi) return { ok: false, loi: e.message };
                throw e;
            }
        },
        // Mất mạng: chỉ người từng đăng nhập thành công trên máy này mới vào được, bằng dấu xác minh đã lưu.
        async dangNhapOffline(ten, matKhau) {
            const bayGio = Date.now();
            const b = await xacMinh.lay(ten.trim().toLowerCase());
            if (!b) return { ok: false, loi: 'Không có kết nối mạng. Tài khoản này chưa từng đăng nhập trên máy này nên chưa thể vào khi offline.' };
            if (!(await kiemTra(matKhau, b.matKhauBam))) {
                if (++this.soLanSai >= 5) { this.soLanSai = 0; this.khoaDen = bayGio + 30000; luuLS(KEY_KHOA, this.khoaDen); }
                return { ok: false, loi: 'Sai tên đăng nhập hoặc mật khẩu.' };
            }
            this.soLanSai = 0;
            matKhauTam = { ten: ten.trim(), matKhau };
            this.datPhien(null, b.nguoiDung);
            return { ok: true };
        },
        // Sau khi đăng nhập offline: có mạng lại thì tự lấy token để đồng bộ. Trả về true nếu có token.
        async thuLayToken() {
            if (this.token) return true;
            if (!matKhauTam) return false;
            try {
                const kq = await goi('POST', '/api/dang-nhap', { tenDangNhap: matKhauTam.ten, matKhau: matKhauTam.matKhau, thietBi: tenThietBi() });
                this.token = kq.token; this.nguoiDung = kq.nguoiDung; this.luuPhien();
                return true;
            } catch (e) {
                if (e instanceof ApiLoi && !e.mang) matKhauTam = null; // bị từ chối (đổi mật khẩu, khóa...): phải đăng nhập lại
                return false;
            }
        },

        async dangXuat({ khongGoiServer = false } = {}) {
            if (!khongGoiServer && this.token) {
                await Promise.race([dongBoNgay(), new Promise((r) => setTimeout(r, 3000))]); // gửi nốt thay đổi còn chờ
                try { await goi('POST', '/api/dang-xuat', {}, { timeout: 4000 }); } catch { /* mất mạng: token tự hết hạn */ }
            }
            dungDongBo();
            matKhauTam = null;
            this.token = null; this.nguoiDung = null;
            this.luuPhien();
        },
        // Server báo token không còn hiệu lực (đã đổi mật khẩu, bị khóa, hết hạn...)
        async hetPhien() {
            if (!this.nguoiDung) return;
            this.thongBao = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            await this.dangXuat({ khongGoiServer: true });
        },

        async doiMatKhau(matKhauCu, matKhauMoi) {
            try {
                const kq = await goi('POST', '/api/doi-mat-khau', { matKhauCu, matKhauMoi });
                const b = await xacMinh.lay(String(this.nguoiDung.tenDangNhap).toLowerCase());
                if (b) await xacMinh.luu({ ...b, matKhauBam: await bam(matKhauMoi) });
                this.capNhatNguoiDung(kq.nguoiDung);
                return { ok: true };
            } catch (e) {
                if (e instanceof ApiLoi) return { ok: false, loi: e.mang ? 'Cần kết nối mạng để đổi mật khẩu.' : e.message, truong: e.truong };
                throw e;
            }
        },
    },
});
