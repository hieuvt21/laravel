import { ShoppingCart } from 'lucide-vue-next';

export default {
    name: 'ban-hang',
    menu: { label: 'Bán hàng', icon: ShoppingCart, to: '/ban-hang', quyen: 'ban-hang.xem', order: 1 },
    permissions: {
        label: 'Bán hàng',
        items: [
            { key: 'ban-hang.xem', label: 'Vào màn hình bán hàng' },
            { key: 'ban-hang.tao-don', label: 'Tạo đơn và thanh toán' },
            { key: 'ban-hang.giam-gia', label: 'Giảm giá đơn hàng' },
            { key: 'ban-hang.sua-gia', label: 'Sửa giá bán khi bán' },
            { key: 'ban-hang.xem-lich-su', label: 'Xem lịch sử đơn hàng' },
            { key: 'ban-hang.huy-don', label: 'Hủy / hoàn đơn' },
        ],
    },
    routes: [
        { path: '/ban-hang', component: () => import('./pages/Index.vue'), meta: { title: 'Bán hàng', quyen: 'ban-hang.xem' } },
    ],
};
