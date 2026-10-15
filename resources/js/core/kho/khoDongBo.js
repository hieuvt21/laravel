import { taoKho } from './kho';
import { hangDoi } from './hangDoi';
import { baoCoViec, dangKyThucThe, layTacGia } from '../dongBo';

// Kho dữ liệu đồng bộ với server: ghi vào máy ngay, đồng thời xếp vào hàng đợi gửi lên.
// Dùng thay cho taoKho() ở những loại dữ liệu cần dùng chung giữa các máy.
const BO = ['createdAt', 'updatedAt', 'dongBoSeq', 'taiKhoan']; // trường chỉ có ở máy / do server quản lý

export function taoKhoDongBo(ten) {
    dangKyThucThe(ten);
    const kho = taoKho(ten);
    return {
        ...kho,
        async luu(doc) {
            const d = await kho.luu(doc);
            const duLieu = Object.fromEntries(Object.entries(d).filter(([k]) => !BO.includes(k)));
            await hangDoi.them({ thucThe: ten, banGhiId: d.id, loai: 'luu', duLieu, taiKhoanId: layTacGia() });
            baoCoViec();
            return d;
        },
        async xoa(id) {
            await kho.xoa(id);
            await hangDoi.them({ thucThe: ten, banGhiId: id, loai: 'xoa', taiKhoanId: layTacGia() });
            baoCoViec();
        },
    };
}
