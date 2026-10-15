// Cổng khách hàng: trang riêng cho tài khoản khách (lịch sử mua hàng, đặt lịch...). Sẽ phát triển sau.
export default {
    name: 'cong-khach',
    routes: [
        { path: '/tai-khoan', component: () => import('./pages/TrangChu.vue'), meta: { trong: true, khach: true, title: 'Tài khoản của tôi' } },
    ],
};
