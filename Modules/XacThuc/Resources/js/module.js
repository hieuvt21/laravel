// Đăng nhập, phiên làm việc và tài khoản. Menu: không có (trang riêng ngoài khung chính).
export default {
    name: 'xac-thuc',
    routes: [
        { path: '/dang-nhap', component: () => import('./pages/DangNhap.vue'), meta: { trong: true, congKhai: true, title: 'Đăng nhập' } },
        { path: '/khong-co-quyen', component: () => import('./pages/KhongCoQuyen.vue'), meta: { trong: true, title: 'Không có quyền' } },
    ],
};
