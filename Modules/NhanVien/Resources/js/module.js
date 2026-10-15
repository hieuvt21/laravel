import { UserCog } from 'lucide-vue-next';

export default {
    name: 'nhan-vien',
    menu: { label: 'Nhân viên', icon: UserCog, to: '/nhan-vien', quyen: 'nhan-vien.xem', order: 5 },
    permissions: {
        label: 'Nhân viên',
        items: [
            { key: 'nhan-vien.xem', label: 'Xem danh sách nhân viên' },
            { key: 'nhan-vien.them-sua', label: 'Thêm / sửa nhân viên' },
            { key: 'nhan-vien.xoa', label: 'Xóa nhân viên' },
            { key: 'nhan-vien.xem-luong', label: 'Xem lương cơ bản' },
        ],
    },
    routes: [
        { path: '/nhan-vien', component: () => import('./pages/Index.vue'), meta: { title: 'Nhân viên', quyen: 'nhan-vien.xem' } },
    ],
};
