import { ShoppingCart } from 'lucide-vue-next';

export default {
    name: 'ban-hang',
    menu: { label: 'Bán hàng', icon: ShoppingCart, to: '/ban-hang', order: 1 },
    routes: [
        { path: '/ban-hang', component: () => import('./pages/Index.vue'), meta: { title: 'Bán hàng' } },
    ],
};
