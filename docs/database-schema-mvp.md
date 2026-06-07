# Database schema MVP

Database chạy trên Supabase PostgreSQL. Backend Node.js/NestJS truy cập qua Prisma.

## Auth and users

- `user_accounts`: email, password hash, role, active flag.
- `profiles`: thông tin cá nhân gắn với user.
- `customer_measurements`: số đo khách hàng.
- `addresses`: địa chỉ giao nhận.

## Catalog and inventory

- `garment_categories`: loại trang phục như áo dài truyền thống, áo dài cách tân, cổ phục.
- `garments`: mẫu trang phục chung.
- `garment_images`: ảnh catalog.
- `garment_assets`: món đồ vật lý thật, có `asset_code` và `status`.

## Rental workflow

- `bookings`: đơn thuê.
- `booking_items`: từng dòng trang phục/phụ kiện trong đơn.
- `booking_status_history`: lịch sử trạng thái đơn.
- `delivery_records`: thông tin giao nhận.

## Financial management

- `payments`: tiền thuê/cọc.
- `penalties`: phí phạt.
- `refunds`: hoàn cọc/hoàn tiền.
- `financial_transactions`: lịch sử giao dịch tài chính đơn giản.

Không dùng `LEDGER_ACCOUNT`, `LEDGER_JOURNAL`, `LEDGER_ENTRY` trong MVP.

## Inspection and maintenance

- `inspection_sessions`: phiên kiểm tra khi trả đồ.
- `inspection_findings`: lỗi phát hiện.
- `inspection_photos`: ảnh bằng chứng.
- `laundry_tickets`: phiếu giặt.
- `maintenance_jobs`: phiếu sửa/bảo trì.

## AI

- `tryon_requests`: request thử đồ ảo.
- `tryon_results`: kết quả thử đồ ảo.

## Important rule

Phần quan trọng nhất khi triển khai tiếp là chống double-booking cùng một `garment_asset` trong cùng khoảng ngày thuê.

Giai đoạn tiếp theo nên thêm backend service transaction cho flow:

```text
create booking
-> check available asset
-> reserve asset
-> create booking_items
```

Không nên chỉ check availability ở frontend.