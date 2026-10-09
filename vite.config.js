import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.js'],
            refresh: true,
        }),
        vue(),
    ],
    server: {
        host: '0.0.0.0', // Mở cổng cho tất cả thiết bị trong mạng LAN và Ngrok
        cors: true,     // Cho phép truyền dữ liệu JS/CSS qua tên miền khác (tránh trắng trang)
        hmr: {
            host: 'localhost', // Giúp Hot Reload hoạt động ổn định
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
            '@modules': fileURLToPath(new URL('./Modules', import.meta.url)),
        },
    },
});