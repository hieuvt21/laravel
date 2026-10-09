import { UserCog } from 'lucide-vue-next';

export default {
    name: 'nhan-vien',
    menu: { label: 'Nhân viên', icon: UserCog, to: '/nhan-vien', order: 5 },
    routes: [
        { path: '/nhan-vien', component: () => import('./pages/Index.vue'), meta: { title: 'Nhân viên' } },
    ],
};
