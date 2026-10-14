import { Users } from 'lucide-vue-next';

export default {
    name: 'khach-hang',
    menu: { label: 'Khách hàng', icon: Users, to: '/khach-hang', order: 4 },
    permissions: {
        label: 'Khách hàng',
        items: [
            { key: 'khach-hang.xem', label: 'Xem khách hàng' },
            { key: 'khach-hang.them-sua', label: 'Thêm / sửa khách hàng' },
            { key: 'khach-hang.xoa', label: 'Xóa khách hàng' },
            { key: 'khach-hang.xem-lich-su', label: 'Xem lịch sử mua hàng' },
        ],
    },
    routes: [
        { path: '/khach-hang', component: () => import('./pages/Index.vue'), meta: { title: 'Khách hàng' } },
    ],
};
