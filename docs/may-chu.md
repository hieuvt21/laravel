# Máy chủ (Laravel) — đăng nhập, phân quyền, đồng bộ

## Cài đặt lần đầu trên cPanel
1. Trong `.env` (trên host) khai báo MySQL: `DB_CONNECTION=mysql`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
2. Thêm `DEPLOY_TOKEN=<chuỗi ngẫu nhiên dài>` (chỉ cần nếu muốn tự chạy migrate sau mỗi lần deploy).
3. Chạy migrate một lần: cPanel › Terminal › `php artisan migrate --force`.
   Sẽ tạo tài khoản `admin` / `123456` (ứng dụng nhắc đổi mật khẩu) và 5 chức vụ mặc định.

## Tự chạy migrate sau deploy (tùy chọn)
Thêm secrets `DEPLOY_TOKEN` và `APP_URL` vào GitHub, rồi thêm bước cuối vào job deploy trong workflow:

```yaml
    env:
      DT: ${{ secrets.DEPLOY_TOKEN }}
    steps:
      # ... các bước FTP hiện có ...
      - name: Chạy migrate trên host
        if: env.DT != ''
        run: |
          curl -fsS -X POST "${{ secrets.APP_URL }}/api/he-thong/cap-nhat" -H "X-Deploy-Token: $DT"
```
Nếu `.env` không có `DEPLOY_TOKEN`, đường dẫn này trả 404 (tắt hẳn).

## Quy tắc
- Quyền do server quyết định ở mỗi request; máy khách chỉ ẩn/hiện giao diện.
- Đồng bộ: máy gửi hàng đợi `POST /api/dong-bo/day`, nhận thay đổi `GET /api/dong-bo/keo` (poll 20 giây).
- Tồn kho không được âm: sẽ ép ở server (khóa dòng + kiểm tra) khi làm module sản phẩm/đơn hàng; đơn tạo offline mà hết hàng khi đồng bộ sẽ bị từ chối và hiện ở banner.
- Máy giữ 20 đơn gần nhất của mỗi khách (khi làm module khách hàng/đơn hàng).

## Test
`php artisan test` (tests/Feature/MayChuTest.php). Chưa chạy được trong môi trường soạn code (không tải được Laravel) — hãy chạy trên máy bạn.
