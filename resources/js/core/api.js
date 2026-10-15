// Gọi API Laravel. Tự gắn token, báo lỗi tiếng Việt, phân biệt "mất mạng" với "server từ chối".
export class ApiLoi extends Error {
    constructor(thongBao, { status = 0, mang = false, truong = null } = {}) {
        super(thongBao);
        this.status = status;   // mã HTTP (0 = không tới được server)
        this.mang = mang;       // true: lỗi mạng / quá thời gian, nên thử lại sau
        this.truong = truong;   // tên trường sai (nếu server chỉ ra)
    }
}

let cau_hinh = { layToken: () => null, khiHetPhien: () => {} };
export function caiApi(c) { cau_hinh = { ...cau_hinh, ...c }; }

function loiTuServer(du_lieu, status) {
    if (du_lieu?.loi) return du_lieu.loi;
    const e = du_lieu?.errors && Object.values(du_lieu.errors).flat()[0];
    if (e) return e;
    if (status === 429) return 'Thao tác quá nhanh. Vui lòng thử lại sau ít giây.';
    return `Máy chủ gặp lỗi (${status}). Vui lòng thử lại.`;
}

export async function goi(phuongThuc, duongDan, body, { timeout = 15000 } = {}) {
    const ctl = new AbortController();
    const dem = setTimeout(() => ctl.abort(), timeout);
    const token = cau_hinh.layToken();
    let res;
    try {
        res = await fetch(duongDan, {
            method: phuongThuc,
            headers: {
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: ctl.signal,
        });
    } catch {
        throw new ApiLoi('Không kết nối được máy chủ.', { mang: true });
    } finally {
        clearTimeout(dem);
    }
    let du_lieu = null;
    try { du_lieu = await res.json(); } catch { /* không phải JSON */ }
    if (!res.ok) {
        if (res.status === 401 && token) cau_hinh.khiHetPhien();
        throw new ApiLoi(loiTuServer(du_lieu, res.status), {
            status: res.status,
            truong: du_lieu?.truong ?? (du_lieu?.errors ? Object.keys(du_lieu.errors)[0] : null),
            mang: res.status >= 502 && res.status <= 504, // host quá tải / đang khởi động: coi như tạm mất kết nối
        });
    }
    return du_lieu;
}
