import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@modules/GiaoDien/Resources/js/components/AppLayout.vue';
import { moduleRoutes } from './registry';

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [{ path: '', redirect: '/ban-hang' }, ...moduleRoutes],
        },
    ],
});
