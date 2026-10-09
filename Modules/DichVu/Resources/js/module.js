import { Wrench } from 'lucide-vue-next';

export default {
    name: 'dich-vu',
    menu: { label: 'Dịch vụ', icon: Wrench, to: '/dich-vu', order: 3 },
    routes: [
        { path: '/dich-vu', component: () => import('./pages/Index.vue'), meta: { title: 'Dịch vụ' } },
    ],
};
