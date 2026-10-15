import { defineStore } from 'pinia';
import { taoKhoDongBo } from '@/core/kho/khoDongBo';
import { goi } from '@/core/api';
import { dongBoNgay, khiThayDoi } from '@/core/dongBo';

const kho = taoKhoDongBo('nhan_vien');
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
                khiThayDoi('nhan_vien', async () => { this.ds = sapXep(await kho.tatCa()); }); // dữ liệu mới từ server
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
        // Lưu nhân viên + tài khoản đăng nhập. tk: { tenDangNhap, matKhau, khoa } | null
        // Thông tin nhân viên đi qua hàng đợi đồng bộ (dùng được khi offline). Tài khoản/mật khẩu thì gọi thẳng server
        // (cần mạng, mật khẩu không nằm lại trên máy). tenDangNhap rỗng = không có tài khoản (đang có thì gỡ).
        async luuVoiTaiKhoan(data, tk) {
            const nv = await this.luu(data);
            const cu = nv.taiKhoan ?? null;
            const muon = !!tk?.tenDangNhap?.trim();
            const ten = tk?.tenDangNhap?.trim() ?? '';
            const doi = muon
                ? !cu || !!tk.matKhau || ten.toLowerCase() !== cu.tenDangNhap.toLowerCase() || !!tk.khoa !== !!cu.khoa
                : !!cu;
            if (!doi) return nv;

            if (!navigator.onLine) {
                throw new Error('Đã lưu nhân viên. Cần kết nối mạng để tạo / đổi tài khoản đăng nhập, hãy mở lại nhân viên này khi có mạng.');
            }
            await dongBoNgay(); // nhân viên phải có trên server trước khi gắn tài khoản
            try {
                if (muon) await goi('PUT', `/api/nhan-vien/${nv.id}/tai-khoan`, { tenDangNhap: ten, matKhau: tk.matKhau || undefined, khoa: !!tk.khoa });
                else await goi('DELETE', `/api/nhan-vien/${nv.id}/tai-khoan`);
            } catch (e) {
                throw new Error(`Đã lưu nhân viên, nhưng chưa cập nhật được tài khoản: ${e.message}`);
            }
            await dongBoNgay(); // kéo về để hiển thị đúng
            return nv;
        },
        async xoa(id) {
            await kho.xoa(id);
            this.ds = this.ds.filter((n) => n.id !== id);
        },
    },
});
