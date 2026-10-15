// Băm mật khẩu: không bao giờ lưu mật khẩu gốc.
// - Có WebCrypto (HTTPS / localhost): PBKDF2-SHA256, 100.000 vòng, muối ngẫu nhiên 16 byte.
// - Không có WebCrypto (mở bằng http:// qua mạng LAN): dự phòng SHA-256 viết tay lặp nhiều vòng. Yếu hơn, chỉ để vẫn chạy được.
const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (h) => Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));
const LAN = 100000;

// ---- SHA-256 dự phòng ----
const SO_NGUYEN_TO = [];
for (let n = 2; SO_NGUYEN_TO.length < 64; n++) if (SO_NGUYEN_TO.every((p) => n % p)) SO_NGUYEN_TO.push(n);
const K = Int32Array.from(SO_NGUYEN_TO, (p) => (Math.cbrt(p) % 1) * 4294967296);
const H0 = Int32Array.from(SO_NGUYEN_TO.slice(0, 8), (p) => (Math.sqrt(p) % 1) * 4294967296);
const xoay = (x, n) => (x >>> n) | (x << (32 - n));

export function sha256(msg) {
    const l = msg.length, n = ((l + 9 + 63) >> 6) << 6;
    const b = new Uint8Array(n); b.set(msg); b[l] = 0x80;
    const dv = new DataView(b.buffer);
    dv.setUint32(n - 4, (l * 8) >>> 0); dv.setUint32(n - 8, Math.floor((l * 8) / 4294967296));
    const H = H0.slice(), w = new Int32Array(64);
    for (let o = 0; o < n; o += 64) {
        for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
        for (let i = 16; i < 64; i++) {
            const s0 = xoay(w[i - 15], 7) ^ xoay(w[i - 15], 18) ^ (w[i - 15] >>> 3);
            const s1 = xoay(w[i - 2], 17) ^ xoay(w[i - 2], 19) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
        let [a, b2, c, d, e, f, g, h] = H;
        for (let i = 0; i < 64; i++) {
            const t1 = (h + (xoay(e, 6) ^ xoay(e, 11) ^ xoay(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
            const t2 = ((xoay(a, 2) ^ xoay(a, 13) ^ xoay(a, 22)) + ((a & b2) ^ (a & c) ^ (b2 & c))) | 0;
            h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
        }
        [a, b2, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    const out = new Uint8Array(32), ov = new DataView(out.buffer);
    H.forEach((v, i) => ov.setUint32(i * 4, v >>> 0));
    return out;
}
function bamDuPhong(mk, salt) {
    const m = enc.encode(mk), nối = (...p) => Uint8Array.from(p.flatMap((x) => [...x]));
    let h = sha256(nối(salt, m));
    for (let i = 0; i < 3000; i++) h = sha256(nối(h, salt, m));
    return hex(h);
}

async function pbkdf2(mk, salt, lan) {
    const k = await crypto.subtle.importKey('raw', enc.encode(mk), 'PBKDF2', false, ['deriveBits']);
    return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: lan, hash: 'SHA-256' }, k, 256));
}

export async function bam(mk) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return globalThis.crypto?.subtle
        ? `p1$${LAN}$${hex(salt)}$${await pbkdf2(mk, salt, LAN)}`
        : `j1$${hex(salt)}$${bamDuPhong(mk, salt)}`;
}

export async function kiemTra(mk, luu) {
    const [loai, ...r] = String(luu ?? '').split('$');
    let tinh = '', that = '';
    try {
        if (loai === 'p1' && globalThis.crypto?.subtle) { tinh = await pbkdf2(mk, unhex(r[1]), Number(r[0])); that = r[2]; }
        else if (loai === 'j1') { tinh = bamDuPhong(mk, unhex(r[0])); that = r[1]; }
        else return false;
    } catch { return false; }
    let kq = tinh.length ^ that.length;
    for (let i = 0; i < tinh.length; i++) kq |= tinh.charCodeAt(i) ^ (that.charCodeAt(i) || 0);
    return kq === 0;
}
