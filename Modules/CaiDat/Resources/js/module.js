import { Settings } from 'lucide-vue-next';

export default {
    name: 'cai-dat',
    // Mục có "children" sẽ hiện mũi tên mở/đóng. Thêm menu phụ mới: thêm một dòng vào children và một route bên dưới.
    menu: {
        label: 'Cài đặt',
        icon: Settings,
        order: 6,
        children: [
            { label: 'Cài đặt giao diện', to: '/cai-dat/giao-dien' },
            { label: 'Phân quyền', to: '/cai-dat/phan-quyen' },
        ],
    },
    permissions: {
        label: 'Cài đặt',
        items: [
            { key: 'cai-dat.giao-dien', label: 'Đổi cài đặt giao diện' },
            { key: 'cai-dat.phan-quyen', label: 'Quản lý phân quyền' },
        ],
    },
    routes: [
        { path: '/cai-dat', redirect: '/cai-dat/giao-dien' },
        {
            path: '/cai-dat/giao-dien',
            component: () => import('./pages/GiaoDien.vue'),
            meta: { title: 'Cài đặt giao diện' },
        },
        {
            path: '/cai-dat/phan-quyen',
            component: () => import('./pages/PhanQuyen.vue'),
            meta: { title: 'Phân quyền' },
        },
    ],
};
