import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@modules/GiaoDien/Resources/js/components/AppLayout.vue';
import { moduleRoutes, routesRieng } from './registry';

export default createRouter({
    history: createWebHistory(),
    routes: [
        ...routesRieng, // đăng nhập, cổng khách hàng... (không có sidebar)
        {
            path: '/',
            component: AppLayout,
            children: [{ path: '', redirect: '/ban-hang' }, ...moduleRoutes],
        },
        { path: '/:khac(.*)*', redirect: '/' },
    ],
});
