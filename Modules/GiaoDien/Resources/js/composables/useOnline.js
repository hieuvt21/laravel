import { ref, onMounted, onBeforeUnmount } from 'vue';

// Theo dõi trạng thái mạng để hiện badge Trực tuyến/Ngoại tuyến trên header.
export function useOnline() {
    const online = ref(navigator.onLine);
    const update = () => (online.value = navigator.onLine);
    onMounted(() => {
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
    });
    onBeforeUnmount(() => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
    });
    return { online };
}
