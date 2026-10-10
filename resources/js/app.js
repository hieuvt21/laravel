import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/core/router';
import { registerServiceWorker } from '@/core/pwa';
import App from '@modules/GiaoDien/Resources/js/App.vue';
import '@modules/GiaoDien/Resources/js/styles/giao-dien.css';

createApp(App).use(createPinia()).use(router).mount('#app');

registerServiceWorker();
