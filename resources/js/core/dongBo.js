// Bộ máy đồng bộ: gửi thay đổi đang chờ lên server, rồi kéo thay đổi mới về. Chạy nền sau khi đăng nhập.
//  - Mọi thao tác ghi vào máy trước (nhanh, dùng được khi mất mạng), đồng thời xếp vào hàng đợi.
//  - Có mạng thì gửi hàng đợi lên (server kiểm tra quyền + dữ liệu), rồi kéo thay đổi của các máy khác về.
//  - Server từ chối một thao tác: thao tác bị bỏ, bản ghi trên máy được khôi phục theo server, người dùng được báo.
import { reactive } from 'vue';
import { goi, ApiLoi } from './api';
import { taoKho } from './kho/kho';
import { hangDoi } from './kho/hangDoi';

const CHU_KY_MS = 20000;
const CHONG_LAP = 20; // kéo lùi 20 dòng nhật ký mỗi lần để không sót thay đổi nếu hai máy ghi gần như cùng lúc
const meta = taoKho('dong_bo_meta');

export const trangThai = reactive({
    dangChay: false,
    soCho: 0,            // thay đổi của người đang đăng nhập chưa gửi được
    soChoNguoiKhac: 0,   // thay đổi của người khác còn nằm trên máy này
    lanCuoi: null,
    loiMang: false,
    canDangNhapLai: false,
    loi: [],             // các thao tác bị server từ chối: { id, thucThe, noiDung }
});

let ctx = { layTaiKhoanId: () => null, layToken: () => null, thuDangNhapLai: async () => false, khiNguoiDungDoi: () => {} };
export function caiDongBo(c) { ctx = { ...ctx, ...c }; }

const daDangKy = new Set();
export const dangKyThucThe = (ten) => daDangKy.add(ten);
export const layTacGia = () => ctx.layTaiKhoanId();

const nguoiNghe = new Map();
export function khiThayDoi(thucThe, fn) {
    if (!nguoiNghe.has(thucThe)) nguoiNghe.set(thucThe, new Set());
    nguoiNghe.get(thucThe).add(fn);
    return () => nguoiNghe.get(thucThe).delete(fn);
}
const phat = (ten) => nguoiNghe.get(ten)?.forEach((fn) => fn());

async function capNhatSoCho() {
    const tk = ctx.layTaiKhoanId();
    const tat_ca = await hangDoi.tatCa();
    trangThai.soCho = tat_ca.filter((o) => o.taiKhoanId === tk).length;
    trangThai.soChoNguoiKhac = tat_ca.length - trangThai.soCho;
}

async function day(tk) {
    for (;;) {
        const ops = (await hangDoi.cua(tk)).slice(0, 50);
        if (!ops.length) return;
        const kq = await goi('POST', '/api/dong-bo/day', {
            cacThaoTac: ops.map(({ id, thucThe, banGhiId, loai, duLieu }) => ({ id, thucThe, banGhiId, loai, duLieu })),
        });
        let tienTrien = 0;
        for (const r of kq.ketQua) {
            const op = ops.find((o) => o.id === r.id);
            await hangDoi.xoa(r.id); // thành công hay bị từ chối đều rời hàng đợi (không gửi lặp mãi)
            tienTrien++;
            if (r.ok) continue;
            trangThai.loi.push({ id: r.id, thucThe: op?.thucThe, noiDung: r.loi });
            if (op) { // khôi phục đúng theo server
                const k = taoKho(op.thucThe);
                if (r.banGhi) await k.ghiThang(r.banGhi); else await k.xoa(op.banGhiId);
                phat(op.thucThe);
            }
        }
        if (!tienTrien) return;
    }
}

async function keo() {
    let con_tro = (await meta.lay('con-tro')) ?? { id: 'con-tro', seq: 0, phienBanQuyen: '' };
    for (;;) {
        const kq = await goi('GET', `/api/dong-bo/keo?since=${Math.max(0, con_tro.seq - CHONG_LAP)}`);

        // Bộ quyền đổi (được cấp / bị thu quyền): tải lại từ đầu để dữ liệu mới được thấy, dữ liệu hết quyền bị xóa khỏi máy
        if (con_tro.phienBanQuyen && kq.phienBanQuyen !== con_tro.phienBanQuyen) {
            con_tro = { ...con_tro, seq: 0, phienBanQuyen: kq.phienBanQuyen };
            await meta.luu(con_tro);
            continue;
        }
        con_tro.phienBanQuyen = kq.phienBanQuyen;

        const dangCho = new Set((await hangDoi.tatCa()).map((o) => `${o.thucThe}|${o.banGhiId}`));
        const doi = new Set();
        for (const c of kq.thayDoi) {
            if (dangCho.has(`${c.thucThe}|${c.banGhiId}`)) continue; // máy này còn thay đổi chưa gửi: giữ nguyên, gửi xong sẽ nhận bản của server
            const k = taoKho(c.thucThe);
            const cu = await k.lay(c.banGhiId);
            if (c.xoa) {
                if (cu) { await k.xoa(c.banGhiId); doi.add(c.thucThe); }
            } else if (!cu || (cu.dongBoSeq ?? -1) < c.seq) {
                await k.ghiThang({ ...c.banGhi, dongBoSeq: c.seq });
                doi.add(c.thucThe);
            }
        }
        for (const ten of daDangKy) {
            if (!kq.quyenDoc.includes(ten)) {
                const k = taoKho(ten);
                if ((await k.tatCa()).length) { await k.xoaHet(); doi.add(ten); }
            }
        }
        con_tro.seq = kq.seq;
        await meta.luu(con_tro);
        ctx.khiNguoiDungDoi(kq.nguoiDung);
        doi.forEach(phat);
        if (!kq.tiepTuc) return;
    }
}

let dangChay = null, xepHang = null;
async function mot_chu_ky() {
    const tk = ctx.layTaiKhoanId();
    if (!tk) return;
    try {
        if (!navigator.onLine) return;
        if (!ctx.layToken()) {
            trangThai.canDangNhapLai = !(await ctx.thuDangNhapLai());
            if (!ctx.layToken()) return;
        }
        trangThai.canDangNhapLai = false;
        trangThai.dangChay = true;
        await day(tk);
        await keo();
        trangThai.loiMang = false;
        trangThai.lanCuoi = new Date();
    } catch (e) {
        if (e instanceof ApiLoi && (e.mang)) trangThai.loiMang = true;
        else if (!(e instanceof ApiLoi && e.status === 401)) console.error('Đồng bộ lỗi:', e);
    } finally {
        trangThai.dangChay = false;
        await capNhatSoCho();
    }
}

// Chạy một lượt đồng bộ ĐẦY ĐỦ bắt đầu sau lúc gọi (nếu đang có lượt chạy dở thì chờ nó xong rồi chạy lượt mới,
// vì lượt dở có thể đã bắt đầu trước khi có thay đổi mới). Trả về khi xong.
export function dongBoNgay() {
    if (!dangChay) {
        dangChay = mot_chu_ky().finally(() => { dangChay = null; });
        return dangChay;
    }
    xepHang ??= dangChay.then(() => { xepHang = null; return dongBoNgay(); });
    return xepHang;
}

let timerChuKy = null, timerNhe = null;
export function baoCoViec() { // vừa ghi thay đổi trên máy: gửi sớm
    capNhatSoCho();
    clearTimeout(timerNhe);
    timerNhe = setTimeout(dongBoNgay, 300);
}
const khiOnline = () => dongBoNgay();
const khiHienLai = () => { if (document.visibilityState === 'visible') dongBoNgay(); };

export function batDauDongBo() {
    dungDongBo();
    dongBoNgay();
    timerChuKy = setInterval(dongBoNgay, CHU_KY_MS);
    window.addEventListener('online', khiOnline);
    document.addEventListener('visibilitychange', khiHienLai);
}
export function dungDongBo() {
    clearInterval(timerChuKy); clearTimeout(timerNhe);
    window.removeEventListener('online', khiOnline);
    document.removeEventListener('visibilitychange', khiHienLai);
}
export const xoaLoi = () => { trangThai.loi.splice(0); };
export const lamMoiSoCho = capNhatSoCho;
