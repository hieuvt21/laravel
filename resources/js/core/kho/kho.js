// Lớp lưu trữ dữ liệu cục bộ (IndexedDB). Mỗi bảng dữ liệu là một "kho": taoKho('nhan_vien').
// Mọi module chỉ dùng 4 hàm: tatCa / lay / luu / xoa. Khi làm đồng bộ với server, chỉ cần thay file này
// (hoặc bọc thêm hàng đợi gửi lên), các module và trang không phải sửa.
// Mỗi bản ghi có id (UUID tạo ngay trên máy), createdAt, updatedAt: sẵn sàng cho đồng bộ nhiều máy.

const TEN_DB = 'pos';
let db = null;
let hangDoi = Promise.resolve();
let dungBoNho = typeof indexedDB === 'undefined'; // chế độ ẩn danh bị chặn IndexedDB: tạm lưu trong RAM
const boNho = new Map();

export const taoId = () =>
    (globalThis.crypto?.randomUUID?.() ??
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 3) | 8).toString(16);
        }));

function mo(version, taoBang) {
    return new Promise((ok, loi) => {
        const rq = version ? indexedDB.open(TEN_DB, version) : indexedDB.open(TEN_DB);
        rq.onupgradeneeded = () => {
            if (taoBang && !rq.result.objectStoreNames.contains(taoBang)) {
                rq.result.createObjectStore(taoBang, { keyPath: 'id' });
            }
        };
        rq.onsuccess = () => {
            const d = rq.result;
            d.onversionchange = () => { d.close(); db = null; }; // tab khác nâng cấp: nhường
            ok(d);
        };
        rq.onerror = () => loi(rq.error);
    });
}

// Chạy một thao tác sau khi bảo đảm bảng tồn tại (tự nâng version khi có module mới thêm bảng).
// Mọi thao tác xếp hàng lần lượt: nâng version đóng kết nối cũ nên không được chạy chen ngang giao tác khác.
function damBao(ten, viec) {
    const p = hangDoi.then(async () => {
        if (!db) db = await mo();
        if (!db.objectStoreNames.contains(ten)) {
            const v = db.version + 1;
            db.close();
            db = await mo(v, ten);
        }
        return viec(db);
    });
    hangDoi = p.catch(() => {});
    return p;
}

function giaoTac(d, ten, che_do, fn) {
    return new Promise((ok, loi) => {
        const t = d.transaction(ten, che_do);
        const rq = fn(t.objectStore(ten));
        t.oncomplete = () => ok(rq?.result);
        t.onerror = () => loi(t.error);
        t.onabort = () => loi(t.error ?? new Error('Giao tác bị hủy'));
    });
}

async function chay(ten, che_do, fn, fnBoNho) {
    if (!dungBoNho) {
        try {
            return await damBao(ten, (d) => giaoTac(d, ten, che_do, fn));
        } catch (e) {
            if (e?.name === 'QuotaExceededError') throw e;
            if (db) throw e; // đã mở được DB mà lỗi khác: báo lỗi thật
            dungBoNho = true;
            console.warn('IndexedDB không dùng được, tạm lưu trong bộ nhớ.', e);
        }
    }
    if (!boNho.has(ten)) boNho.set(ten, new Map());
    return fnBoNho(boNho.get(ten));
}

const sao = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

export function taoKho(ten) {
    return {
        tatCa: async () => (await chay(ten, 'readonly', (s) => s.getAll(), (m) => [...m.values()])).map(sao),
        lay: async (id) => sao(await chay(ten, 'readonly', (s) => s.get(id), (m) => m.get(id))),
        // Thêm mới (chưa có id) hoặc cập nhật. Trả về bản ghi đã lưu.
        async luu(doc) {
            const bay_gio = new Date().toISOString();
            const ban_ghi = sao({ ...doc, id: doc.id ?? taoId(), createdAt: doc.createdAt ?? bay_gio, updatedAt: bay_gio });
            await chay(ten, 'readwrite', (s) => s.put(ban_ghi), (m) => m.set(ban_ghi.id, ban_ghi));
            return sao(ban_ghi);
        },
        // Ghi nguyên bản ghi từ server (không đổi id/dấu thời gian, không đưa vào hàng đợi gửi lên)
        ghiThang: (doc) => chay(ten, 'readwrite', (s) => s.put(sao(doc)), (m) => m.set(doc.id, sao(doc))).then(() => undefined),
        xoaHet: () => chay(ten, 'readwrite', (s) => s.clear(), (m) => m.clear()).then(() => undefined),
        xoa: (id) => chay(ten, 'readwrite', (s) => s.delete(id), (m) => m.delete(id)).then(() => undefined),
    };
}
