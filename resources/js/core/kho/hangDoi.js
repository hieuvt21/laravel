import { taoKho, taoId } from './kho';

// Hàng đợi thay đổi chờ gửi lên server (lưu trong IndexedDB nên không mất khi tắt máy / tải lại trang).
// Mỗi thao tác ghi nhận tác giả (taiKhoanId): chỉ gửi khi đúng người đó đang đăng nhập.
const kho = taoKho('hang_doi');
let dem = 0;

export const hangDoi = {
    them: ({ thucThe, banGhiId, loai, duLieu, taiKhoanId }) =>
        kho.luu({ id: taoId(), thuTu: Date.now() * 1000 + (dem++ % 1000), thucThe, banGhiId, loai, duLieu, taiKhoanId }),
    tatCa: async () => (await kho.tatCa()).sort((a, b) => a.thuTu - b.thuTu),
    cua: async (taiKhoanId) => (await hangDoi.tatCa()).filter((o) => o.taiKhoanId === taiKhoanId),
    xoa: (id) => kho.xoa(id),
};
