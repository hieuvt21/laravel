import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/core/router';
import { caiGuard } from '@/core/guard';
import { registerServiceWorker } from '@/core/pwa';
import App from '@modules/GiaoDien/Resources/js/App.vue';
import { useThemeStore } from '@modules/GiaoDien/Resources/js/stores/theme';
import '@modules/GiaoDien/Resources/js/styles/giao-dien.css';

const pinia = createPinia();
caiGuard(router, pinia);
const app = createApp(App).use(pinia).use(router);

// Áp cài đặt giao diện (màu, cỡ chữ...) trước khi hiển thị để không bị nháy màu cũ.
useThemeStore(pinia).apDung();

app.mount('#app');

registerServiceWorker();
