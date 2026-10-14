import { Wrench } from 'lucide-vue-next';

export default {
    name: 'dich-vu',
    menu: { label: 'Dịch vụ', icon: Wrench, to: '/dich-vu', order: 3 },
    permissions: {
        label: 'Dịch vụ',
        items: [
            { key: 'dich-vu.xem', label: 'Xem dịch vụ' },
            { key: 'dich-vu.them-sua', label: 'Thêm / sửa dịch vụ' },
            { key: 'dich-vu.xoa', label: 'Xóa dịch vụ' },
        ],
    },
    routes: [
        { path: '/dich-vu', component: () => import('./pages/Index.vue'), meta: { title: 'Dịch vụ' } },
    ],
};
