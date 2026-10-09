import { Users } from 'lucide-vue-next';

export default {
    name: 'khach-hang',
    menu: { label: 'Khách hàng', icon: Users, to: '/khach-hang', order: 4 },
    routes: [
        { path: '/khach-hang', component: () => import('./pages/Index.vue'), meta: { title: 'Khách hàng' } },
    ],
};
