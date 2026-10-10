/*
 * Service worker của POS, bước 1: mở được giao diện khi mất mạng.
 *
 *  - Mở trang (navigation): ưu tiên mạng. Mất mạng hoặc chậm quá 3 giây thì dùng khung trang đã lưu.
 *  - /build/* và /icons/*: lấy từ bộ nhớ đệm trước. Tên file do Vite đặt có mã băm nên không bao giờ bị cũ.
 *  - Mọi yêu cầu khác (đặc biệt là /api/* và các yêu cầu không phải GET): đi thẳng ra mạng.
 *    Việc lưu và đồng bộ dữ liệu offline do ứng dụng (IndexedDB) xử lý, không phải service worker.
 *
 * Cập nhật bản lưu: ứng dụng gửi message { type: 'precache' } mỗi lần mở và mỗi khi có mạng trở lại.
 * Nhờ vậy sau mỗi lần deploy, bản lưu tự đổi theo mà không cần sửa file này.
 */

const CACHE = 'pos-shell';
const SHELL = '/'; // trang HTML của SPA do Laravel trả về (mọi đường dẫn đều dùng chung)
const NAV_TIMEOUT_MS = 3000;
const EXTRAS = [
    '/manifest.webmanifest',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-512.png',
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>POS Cửa hàng</title>
<style>body{font-family:system-ui,sans-serif;background:#f5f6f8;color:#1f2937;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px}</style>
</head><body><div>
<h1 style="font-size:20px;margin:0 0 8px">Chưa có dữ liệu để mở khi mất mạng</h1>
<p style="margin:0;color:#6b7280">Hãy kết nối mạng và mở lại ứng dụng một lần để lưu về máy.</p>
</div></body></html>`;

self.addEventListener('install', (event) => {
    event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'precache') {
        event.waitUntil(precache().catch(() => {}));
    }
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    if (req.mode === 'navigate') {
        event.respondWith(navigate(req));
        return;
    }

    if (url.pathname.startsWith('/build/') || url.pathname.startsWith('/icons/')) {
        event.respondWith(cacheFirst(req));
    }
});

/** Lưu khung trang và toàn bộ file mà Vite đã build (đọc từ manifest). */
async function precache() {
    const cache = await caches.open(CACHE);

    // 1. Khung HTML. Lấy mới mỗi lần để luôn trỏ đúng các file build hiện hành.
    const shell = await fetch(SHELL, { cache: 'no-store' });
    if (!shell.ok) throw new Error('Không tải được trang chính');
    await cache.put(SHELL, shell);

    // 2. Danh sách file build, gồm cả các chunk của trang tải lười (dynamic import).
    const res = await fetch('/build/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Không đọc được /build/manifest.json');
    const manifest = await res.json();

    const urls = new Set();
    for (const entry of Object.values(manifest)) {
        if (entry.file) urls.add('/build/' + entry.file);
        (entry.css || []).forEach((f) => urls.add('/build/' + f));
        (entry.assets || []).forEach((f) => urls.add('/build/' + f));
    }

    // Tải những file chưa có. File build bắt buộc tải được, thiếu thì báo lỗi để thử lại sau.
    const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
    await Promise.all(
        [...urls]
            .filter((u) => !have.has(u))
            .map(async (u) => {
                const r = await fetch(u);
                if (!r.ok) throw new Error('Không tải được ' + u);
                await cache.put(u, r);
            }),
    );

    // File phụ (icon, manifest): thiếu cũng không sao.
    await Promise.all(
        EXTRAS.map(async (u) => {
            try {
                const r = await fetch(u, { cache: 'no-store' });
                if (r.ok) await cache.put(u, r);
            } catch (_) {
                /* bỏ qua */
            }
        }),
    );

    // 3. Dọn các file build của phiên bản cũ.
    for (const req of await cache.keys()) {
        const p = new URL(req.url).pathname;
        if (p.startsWith('/build/') && !urls.has(p)) await cache.delete(req);
    }
}

async function navigate(req) {
    try {
        return await fetchWithTimeout(req, NAV_TIMEOUT_MS);
    } catch (_) {
        const cache = await caches.open(CACHE);
        const shell = await cache.match(SHELL, { ignoreVary: true });
        return (
            shell ||
            new Response(OFFLINE_HTML, {
                status: 503,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
        );
    }
}

async function cacheFirst(req) {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreVary: true });
    if (hit) return hit;

    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
}

function fetchWithTimeout(req, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), ms);
        fetch(req).then(
            (r) => {
                clearTimeout(timer);
                resolve(r);
            },
            (e) => {
                clearTimeout(timer);
                reject(e);
            },
        );
    });
}
