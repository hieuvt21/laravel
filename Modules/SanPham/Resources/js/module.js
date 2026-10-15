import { Package } from 'lucide-vue-next';

export default {
    name: 'san-pham',
    menu: { label: 'Sản phẩm', icon: Package, to: '/san-pham', quyen: 'san-pham.xem', order: 2 },
    permissions: {
        label: 'Sản phẩm',
        items: [
            { key: 'san-pham.xem', label: 'Xem sản phẩm' },
            { key: 'san-pham.them-sua', label: 'Thêm / sửa sản phẩm' },
            { key: 'san-pham.xoa', label: 'Xóa sản phẩm' },
            { key: 'san-pham.xem-gia-von', label: 'Xem giá vốn' },
            { key: 'san-pham.dieu-chinh-kho', label: 'Điều chỉnh tồn kho' },
        ],
    },
    routes: [
        { path: '/san-pham', component: () => import('./pages/Index.vue'), meta: { title: 'Sản phẩm', quyen: 'san-pham.xem' } },
    ],
};
