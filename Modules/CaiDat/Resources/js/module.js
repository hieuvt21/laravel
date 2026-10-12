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
        ],
    },
    routes: [
        { path: '/cai-dat', redirect: '/cai-dat/giao-dien' },
        {
            path: '/cai-dat/giao-dien',
            component: () => import('./pages/GiaoDien.vue'),
            meta: { title: 'Cài đặt giao diện' },
        },
    ],
};
