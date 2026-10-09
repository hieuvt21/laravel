import { Package } from 'lucide-vue-next';

export default {
    name: 'san-pham',
    menu: { label: 'Sản phẩm', icon: Package, to: '/san-pham', order: 2 },
    routes: [
        { path: '/san-pham', component: () => import('./pages/Index.vue'), meta: { title: 'Sản phẩm' } },
    ],
};
