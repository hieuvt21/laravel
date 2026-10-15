// Tự động nạp mọi module: Modules/<Ten>/Resources/js/module.js
// Thêm module mới = tạo thư mục + file module.js, không phải sửa file lõi.
const files = import.meta.glob('../../../Modules/*/Resources/js/module.js', { eager: true });

export const modules = Object.values(files)
    .map((m) => m.default)
    .filter(Boolean);

const tatCaRoutes = modules.flatMap((m) => m.routes ?? []);
// Route có meta.trong = trang riêng, không nằm trong khung sidebar/header (đăng nhập, cổng khách hàng...)
export const routesRieng = tatCaRoutes.filter((r) => r.meta?.trong);
export const moduleRoutes = tatCaRoutes.filter((r) => !r.meta?.trong);

export const menuItems = modules
    .filter((m) => m.menu)
    .map((m) => ({ ...m.menu, key: m.name }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

// Danh mục quyền: mỗi module khai báo `permissions: { label, items: [{ key, label }] }` trong module.js.
// Trang Cài đặt > Phân quyền tự dựng bảng từ đây, thêm module mới thì quyền mới tự xuất hiện.
export const nhomQuyen = modules
    .filter((m) => m.permissions)
    .map((m) => ({
        module: m.name,
        label: m.permissions.label,
        items: m.permissions.items,
        order: m.menu?.order ?? 99,
    }))
    .sort((a, b) => a.order - b.order);

export const tatCaQuyen = nhomQuyen.flatMap((g) => g.items.map((i) => i.key));

// Menu mà người dùng được thấy: mục (hoặc mục phụ) có `quyen` thì cần có quyền đó; không khai báo quyen = ai cũng thấy.
export function menuChoQuyen(coQuyen) {
    return menuItems
        .map((m) => {
            if (!m.children) return coQuyen(m.quyen) ? m : null;
            const c = m.children.filter((x) => coQuyen(x.quyen));
            return c.length ? { ...m, children: c } : null;
        })
        .filter(Boolean);
}
export const trangDauTien = (ds) => ds[0]?.children?.[0]?.to ?? ds[0]?.to ?? null;
