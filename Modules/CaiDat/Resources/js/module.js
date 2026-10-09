import { Settings } from 'lucide-vue-next';

export default {
    name: 'cai-dat',
    menu: { label: 'Cài đặt', icon: Settings, to: '/cai-dat', order: 6 },
    routes: [
        { path: '/cai-dat', component: () => import('./pages/Index.vue'), meta: { title: 'Cài đặt' } },
    ],
};
