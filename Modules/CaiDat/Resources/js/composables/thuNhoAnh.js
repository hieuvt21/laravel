/**
 * Thu nhỏ một file ảnh về tối đa `max` điểm ảnh ở cạnh dài nhất, trả về dạng data URL (PNG).
 * Dùng cho logo để lưu gọn trong bộ nhớ trình duyệt.
 */
export function thuNhoAnh(file, max = 128) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            // Ảnh SVG không có kích thước riêng thì lấy luôn kích thước tối đa
            const w = img.naturalWidth || max;
            const h = img.naturalHeight || max;
            const tiLe = Math.min(1, max / Math.max(w, h));

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(w * tiLe));
            canvas.height = Math.max(1, Math.round(h * tiLe));
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Không đọc được ảnh'));
        };
        img.src = url;
    });
}
