import { useXacThuc } from '@modules/XacThuc/Resources/js/stores/xacThuc';

// Cổng kiểm soát truy cập cho mọi đường dẫn.
//  - Chưa đăng nhập: chỉ vào được trang có meta.congKhai (đăng nhập).
//  - Khách hàng: chỉ vào trang có meta.khach.
//  - Admin/nhân viên: vào trang có đủ quyền (meta.quyen); thiếu quyền thì về trang đầu tiên được phép.
export function caiGuard(router, pinia) {
    router.beforeEach(async (to) => {
        const auth = useXacThuc(pinia);
        await auth.khoiTao();

        if (!auth.user) {
            if (to.meta.congKhai) return true;
            return { path: '/dang-nhap', query: to.fullPath !== '/' ? { tiep: to.fullPath } : {} };
        }
        if (to.meta.congKhai) return auth.trangChu;
        if (auth.user.loai === 'khach-hang') return to.meta.khach ? true : auth.trangChu;
        if (to.meta.khach) return auth.trangChu;
        if (to.meta.quyen && !auth.coQuyen(to.meta.quyen)) return auth.trangChu === to.path ? true : auth.trangChu;
        return true;
    });
}
