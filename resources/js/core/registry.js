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
