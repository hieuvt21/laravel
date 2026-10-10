// Đăng ký service worker để app mở được khi mất mạng.
// Chỉ chạy ở bản build (npm run build). Khi chạy npm run dev thì bỏ qua để khỏi vướng cache.
export function registerServiceWorker() {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    const batDau = async () => {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            await navigator.serviceWorker.ready;

            // Mỗi lần mở app và mỗi khi có mạng trở lại, nhờ service worker cập nhật bản lưu.
            const capNhat = () => {
                const sw = navigator.serviceWorker.controller || reg.active;
                if (sw) sw.postMessage({ type: 'precache' });
            };
            capNhat();
            window.addEventListener('online', capNhat);

            // Xin trình duyệt giữ dữ liệu lâu dài, tránh bị dọn khi máy thiếu bộ nhớ.
            if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
        } catch (e) {
            console.warn('Không đăng ký được service worker', e);
        }
    };

    if (document.readyState === 'complete') batDau();
    else window.addEventListener('load', batDau);
}
