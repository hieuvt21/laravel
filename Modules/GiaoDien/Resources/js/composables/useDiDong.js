import { onBeforeUnmount, ref } from 'vue';

// true khi màn hình hẹp (<= 860px): dùng ngăn kéo + menu xổ xuống thay vì bảng nổi.
export function useDiDong(query = '(max-width: 860px)') {
    const mq = window.matchMedia(query);
    const laDiDong = ref(mq.matches);
    const doi = (e) => { laDiDong.value = e.matches; };
    mq.addEventListener('change', doi);
    onBeforeUnmount(() => mq.removeEventListener('change', doi));
    return { laDiDong };
}
