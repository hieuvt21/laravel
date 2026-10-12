// Từ một màu chủ đạo, tính ra các màu phụ để giao diện luôn đọc rõ dù người dùng chọn màu nào.

// Độ tương phản tối thiểu của chữ/icon màu chủ đạo trên nền nhạt. Dùng cho nhãn đậm và icon của menu,
// nên lấy 3.5 (giữ được sắc cam tươi); muốn chặt hơn cho chữ thường thì tăng lên 4.5.
const TUONG_PHAN_TOI_THIEU = 3.5;

const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbHex = (a) =>
    '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

// t = 0 giữ nguyên màu a, t = 1 thành màu b
const tron = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const tuyenTinh = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const doSang = ([r, g, b]) => 0.2126 * tuyenTinh(r) + 0.7152 * tuyenTinh(g) + 0.0722 * tuyenTinh(b);

/** Độ tương phản giữa hai màu (chuẩn WCAG), từ 1 đến 21. */
export function doTuongPhan(a, b) {
    const [sang, toi] = [doSang(a), doSang(b)].sort((x, y) => y - x);
    return (sang + 0.05) / (toi + 0.05);
}

/**
 * @param {string} hex màu chủ đạo dạng #rrggbb
 * @returns primary: màu gốc; soft: nền nhạt cho mục đang chọn;
 *          ink: màu chữ/icon trên nền nhạt (đủ tương phản tối thiểu);
 *          onPrimary: màu chữ đặt trên nền màu chủ đạo (trắng hoặc xám đậm)
 */
export function bangMau(hex) {
    const goc = hexRgb(hex);
    const trang = [255, 255, 255];
    const nen = tron(goc, trang, 0.88);

    let chu = goc;
    for (let t = 0.05; doTuongPhan(chu, nen) < TUONG_PHAN_TOI_THIEU && t <= 1; t += 0.05) chu = tron(goc, [0, 0, 0], t);

    return {
        primary: hex,
        soft: rgbHex(nen),
        ink: rgbHex(chu),
        // Giữ chữ trắng cho màu vừa (như cam), chỉ chuyển sang chữ tối khi màu quá sáng
        onPrimary: doTuongPhan(trang, goc) >= 1.9 ? '#ffffff' : '#1f2937',
    };
}
