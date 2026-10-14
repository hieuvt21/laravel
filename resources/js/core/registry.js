// Tự động nạp mọi module: Modules/<Ten>/Resources/js/module.js
// Thêm module mới = tạo thư mục + file module.js, không phải sửa file lõi.
const files = import.meta.glob('../../../Modules/*/Resources/js/module.js', { eager: true });

export const modules = Object.values(files)
    .map((m) => m.default)
    .filter(Boolean);

export const moduleRoutes = modules.flatMap((m) => m.routes ?? []);

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
