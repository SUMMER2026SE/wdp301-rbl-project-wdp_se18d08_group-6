-- ============================================================
-- 005_seed_sample_rentals.sql
-- Dữ liệu mẫu cho toàn bộ luồng thuê trang phục.
-- Chạy sau: 001_initial_schema.sql, 004_restore_missing_objects.sql, 003_seed_catalog.sql
-- ============================================================

-- Dùng transaction để dễ rollback nếu có lỗi
begin;

-- ------------------------------------------------------------
-- 0. Extension cần thiết
-- ------------------------------------------------------------
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. USER ACCOUNTS (1 admin, 2 staff, 4 customers)
-- ------------------------------------------------------------
insert into public.user_accounts (id, email, password_hash, role, is_active, is_email_verified) values
  -- Admin
  ('00000000-0000-0000-0000-000000000001', 'admin@rbl.vn',
   '$2b$10$examplehashADMIN000000000000000000000000000000000000000', 'admin', true, true),

  -- Staff
  ('00000000-0000-0000-0000-000000000002', 'nhanvien01@rbl.vn',
   '$2b$10$examplehashSTAFF01000000000000000000000000000000000000', 'staff', true, true),
  ('00000000-0000-0000-0000-000000000003', 'nhanvien02@rbl.vn',
   '$2b$10$examplehashSTAFF02000000000000000000000000000000000000', 'staff', true, true),

  -- Customers
  ('00000000-0000-0000-0000-000000000010', 'nguyenthimai@gmail.com',
   '$2b$10$examplehashCUST0100000000000000000000000000000000000000', 'customer', true, true),
  ('00000000-0000-0000-0000-000000000011', 'tranthanhlong@gmail.com',
   '$2b$10$examplehashCUST0200000000000000000000000000000000000000', 'customer', true, true),
  ('00000000-0000-0000-0000-000000000012', 'lehoanganh@gmail.com',
   '$2b$10$examplehashCUST0300000000000000000000000000000000000000', 'customer', true, false),
  ('00000000-0000-0000-0000-000000000013', 'phamquockhanh@gmail.com',
   '$2b$10$examplehashCUST0400000000000000000000000000000000000000', 'customer', false, false)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. PROFILES
-- ------------------------------------------------------------
insert into public.profiles (user_id, full_name, phone) values
  ('00000000-0000-0000-0000-000000000001', 'Quản Trị Viên',        '0901000001'),
  ('00000000-0000-0000-0000-000000000002', 'Nguyễn Văn Khoa',      '0901000002'),
  ('00000000-0000-0000-0000-000000000003', 'Trần Thị Linh',        '0901000003'),
  ('00000000-0000-0000-0000-000000000010', 'Nguyễn Thị Mai',       '0912345610'),
  ('00000000-0000-0000-0000-000000000011', 'Trần Thanh Long',      '0912345611'),
  ('00000000-0000-0000-0000-000000000012', 'Lê Hoàng Anh',         '0912345612'),
  ('00000000-0000-0000-0000-000000000013', 'Phạm Quốc Khánh',      '0912345613')
on conflict (user_id) do nothing;

-- ------------------------------------------------------------
-- 3. CUSTOMER MEASUREMENTS
-- ------------------------------------------------------------
insert into public.customer_measurements
  (customer_id, height_cm, weight_kg, bust_cm, waist_cm, hip_cm, usual_size) values
  ('00000000-0000-0000-0000-000000000010', 162, 52, 84, 64, 90, 'S'),
  ('00000000-0000-0000-0000-000000000011', 175, 70, 92, 78, 96, 'L'),
  ('00000000-0000-0000-0000-000000000012', 158, 48, 80, 62, 88, 'XS')
on conflict do nothing;

-- ------------------------------------------------------------
-- 4. ADDRESSES
-- ------------------------------------------------------------
insert into public.addresses (id, customer_id, receiver_name, phone, line1, ward, district, city, is_default) values
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000010',
   'Nguyễn Thị Mai', '0912345610',
   '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', true),

  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000010',
   'Nguyễn Thị Mai', '0912345610',
   '55B Lê Lợi', 'Phường 2', 'Quận 3', 'TP. Hồ Chí Minh', false),

  ('00000000-0000-0000-0001-000000000003',
   '00000000-0000-0000-0000-000000000011',
   'Trần Thanh Long', '0912345611',
   '88 Trần Hưng Đạo', 'Nguyễn Cư Trinh', 'Quận 1', 'TP. Hồ Chí Minh', true),

  ('00000000-0000-0000-0001-000000000004',
   '00000000-0000-0000-0000-000000000012',
   'Lê Hoàng Anh', '0912345612',
   '23 Đinh Tiên Hoàng', 'Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 5. GARMENT CATEGORIES (mở rộng thêm)
-- ------------------------------------------------------------
insert into public.garment_categories (id, name, description) values
  ('00000000-0000-0000-0002-000000000001', 'Áo dài truyền thống', 'Trang phục áo dài Việt Nam truyền thống'),
  ('00000000-0000-0000-0002-000000000002', 'Áo dài cách tân',     'Áo dài cách tân phù hợp chụp ảnh và sự kiện'),
  ('00000000-0000-0000-0002-000000000003', 'Cổ phục',             'Nhật Bình, Áo Tấc, Ngũ Thân và các dòng cổ phục VN'),
  ('00000000-0000-0000-0002-000000000004', 'Váy cưới',            'Váy cưới và phụ kiện cưới cao cấp'),
  ('00000000-0000-0000-0002-000000000005', 'Vest & Suit',         'Vest nam, suit nữ cho sự kiện trang trọng')
on conflict (name) do nothing;

-- ------------------------------------------------------------
-- 6. GARMENTS
-- ------------------------------------------------------------
insert into public.garments
  (id, category_id, name, description, size_label, color, daily_price, deposit_amount) values

  -- Áo dài truyền thống
  ('00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0002-000000000001',
   'Áo dài đỏ thêu sen', 'Áo dài đỏ với hoạ tiết sen nổi bật, vải lụa cao cấp',
   'M', 'Đỏ', 350000, 1000000),

  ('00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0002-000000000001',
   'Áo dài xanh ngọc thêu hoa', 'Áo dài xanh ngọc thêu hoa văn tinh tế',
   'S', 'Xanh ngọc', 380000, 1100000),

  -- Áo dài cách tân
  ('00000000-0000-0000-0003-000000000003',
   '00000000-0000-0000-0002-000000000002',
   'Áo dài trắng lụa mềm', 'Áo dài cách tân màu trắng, chất liệu lụa mềm mại',
   'S-M', 'Trắng', 320000, 900000),

  ('00000000-0000-0000-0003-000000000004',
   '00000000-0000-0000-0002-000000000002',
   'Áo dài hồng pastel', 'Áo dài cách tân tông hồng nhẹ nhàng, phù hợp chụp ảnh',
   'S', 'Hồng pastel', 300000, 850000),

  -- Cổ phục
  ('00000000-0000-0000-0003-000000000005',
   '00000000-0000-0000-0002-000000000003',
   'Nhật Bình xanh ngọc', 'Bộ Nhật Bình xanh ngọc kèm phụ kiện hoàng gia',
   'S-M', 'Xanh ngọc', 550000, 1500000),

  ('00000000-0000-0000-0003-000000000006',
   '00000000-0000-0000-0002-000000000003',
   'Áo Tấc nâu trầm', 'Áo Tấc tông nâu trầm cho chụp ảnh cổ trang',
   'L', 'Nâu', 480000, 1200000),

  -- Váy cưới
  ('00000000-0000-0000-0003-000000000007',
   '00000000-0000-0000-0002-000000000004',
   'Váy cưới xòe trắng', 'Váy cưới xòe công chúa, đính đá pha lê, vải tulle',
   'S-M', 'Trắng', 900000, 3000000),

  -- Vest & Suit
  ('00000000-0000-0000-0003-000000000008',
   '00000000-0000-0000-0002-000000000005',
   'Vest đen 3 mảnh nam', 'Vest đen 3 mảnh cao cấp dành cho chú rể và sự kiện',
   'L', 'Đen', 450000, 1500000)

on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 7. GARMENT ASSETS (mỗi garment có 3 asset)
-- ------------------------------------------------------------
insert into public.garment_assets (id, garment_id, asset_code, status, condition_note, purchase_cost) values
  -- Áo dài đỏ thêu sen
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001', 'ADO-001-A', 'available',   'Mới, chưa qua sử dụng', 2500000),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000001', 'ADO-001-B', 'available',   'Tốt, đã giặt ủi', 2500000),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000001', 'ADO-001-C', 'maintenance', 'Đang sửa chỉ thêu', 2500000),

  -- Áo dài xanh ngọc
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000002', 'ADX-002-A', 'available',   'Tốt', 2800000),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000002', 'ADX-002-B', 'rented',      'Đang cho thuê', 2800000),

  -- Áo dài trắng lụa mềm
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0003-000000000003', 'ADT-003-A', 'available',   'Tốt', 2200000),
  ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0003-000000000003', 'ADT-003-B', 'laundry',     'Đang giặt sau thuê', 2200000),

  -- Áo dài hồng pastel
  ('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0003-000000000004', 'ADH-004-A', 'available',   'Tốt', 2000000),

  -- Nhật Bình xanh ngọc
  ('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0003-000000000005', 'NBX-005-A', 'available',   'Mới', 5000000),
  ('00000000-0000-0000-0004-000000000010', '00000000-0000-0000-0003-000000000005', 'NBX-005-B', 'available',   'Tốt', 5000000),

  -- Áo Tấc nâu trầm
  ('00000000-0000-0000-0004-000000000011', '00000000-0000-0000-0003-000000000006', 'ATN-006-A', 'available',   'Tốt', 4000000),

  -- Váy cưới
  ('00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0003-000000000007', 'VCT-007-A', 'available',   'Mới', 15000000),
  ('00000000-0000-0000-0004-000000000013', '00000000-0000-0000-0003-000000000007', 'VCT-007-B', 'rented',      'Đang cho thuê', 15000000),

  -- Vest đen
  ('00000000-0000-0000-0004-000000000014', '00000000-0000-0000-0003-000000000008', 'VDB-008-A', 'available',   'Tốt', 6000000),
  ('00000000-0000-0000-0004-000000000015', '00000000-0000-0000-0003-000000000008', 'VDB-008-B', 'available',   'Mới', 6000000)
on conflict (asset_code) do nothing;

-- ------------------------------------------------------------
-- 8. GARMENT IMAGES
-- ------------------------------------------------------------
insert into public.garment_images (garment_id, image_url, alt_text, sort_order) values
  ('00000000-0000-0000-0003-000000000001', 'https://placehold.co/600x800/FF4D4D/white?text=Ao+dai+do', 'Áo dài đỏ thêu sen', 0),
  ('00000000-0000-0000-0003-000000000002', 'https://placehold.co/600x800/00B4AB/white?text=Ao+dai+xanh', 'Áo dài xanh ngọc', 0),
  ('00000000-0000-0000-0003-000000000003', 'https://placehold.co/600x800/F0F0F0/333?text=Ao+dai+trang', 'Áo dài trắng lụa', 0),
  ('00000000-0000-0000-0003-000000000004', 'https://placehold.co/600x800/FFB3C6/333?text=Ao+dai+hong', 'Áo dài hồng pastel', 0),
  ('00000000-0000-0000-0003-000000000005', 'https://placehold.co/600x800/00B4AB/white?text=Nhat+Binh', 'Nhật Bình xanh ngọc', 0),
  ('00000000-0000-0000-0003-000000000006', 'https://placehold.co/600x800/7B4F2E/white?text=Ao+Tac', 'Áo Tấc nâu trầm', 0),
  ('00000000-0000-0000-0003-000000000007', 'https://placehold.co/600x800/FFFFFF/999?text=Vay+cuoi', 'Váy cưới xòe trắng', 0),
  ('00000000-0000-0000-0003-000000000008', 'https://placehold.co/600x800/1A1A1A/white?text=Vest+den', 'Vest đen 3 mảnh', 0)
on conflict do nothing;

-- ------------------------------------------------------------
-- 9. BOOKINGS
-- Booking 1: completed (Mai - áo dài đỏ, đã trả, đã thanh toán)
-- Booking 2: renting  (Mai - nhật bình, đang thuê)
-- Booking 3: confirmed (Long - váy cưới + vest)
-- Booking 4: pending_confirmation (Anh - áo dài hồng)
-- Booking 5: cancelled (Long - áo tấc)
-- ------------------------------------------------------------
insert into public.bookings
  (id, customer_id, status, rental_start_date, rental_end_date,
   pickup_method, delivery_address_id,
   rental_total, deposit_total, penalty_total, note) values

  -- Booking 1: Completed
  ('00000000-0000-0000-0005-000000000001',
   '00000000-0000-0000-0000-000000000010',
   'completed',
   '2026-06-01', '2026-06-03',
   'store_pickup', null,
   700000, 1000000, 0,
   'Đặt trước 2 ngày, khách đến lấy đúng giờ'),

  -- Booking 2: Renting (đang thuê)
  ('00000000-0000-0000-0005-000000000002',
   '00000000-0000-0000-0000-000000000010',
   'renting',
   '2026-06-14', '2026-06-16',
   'store_pickup', null,
   1100000, 1500000, 0,
   'Khách đến nhận trang phục tại cửa hàng'),

  -- Booking 3: Confirmed (đặt ship về nhà)
  ('00000000-0000-0000-0005-000000000003',
   '00000000-0000-0000-0000-000000000011',
   'confirmed',
   '2026-06-20', '2026-06-22',
   'delivery', '00000000-0000-0000-0001-000000000003',
   2700000, 4500000, 0,
   'Giao trước ngày cưới 1 ngày'),

  -- Booking 4: Pending confirmation
  ('00000000-0000-0000-0005-000000000004',
   '00000000-0000-0000-0000-000000000012',
   'pending_confirmation',
   '2026-06-25', '2026-06-26',
   'store_pickup', null,
   300000, 850000, 0,
   null),

  -- Booking 5: Cancelled
  ('00000000-0000-0000-0005-000000000005',
   '00000000-0000-0000-0000-000000000011',
   'cancelled',
   '2026-06-10', '2026-06-12',
   'store_pickup', null,
   960000, 1200000, 0,
   'Khách huỷ vì bận việc đột xuất')

on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 10. BOOKING ITEMS
-- ------------------------------------------------------------
insert into public.booking_items
  (booking_id, garment_id, garment_asset_id, daily_price, deposit_amount) values

  -- Booking 1: áo dài đỏ x2 ngày
  ('00000000-0000-0000-0005-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0004-000000000001',
   350000, 1000000),

  -- Booking 2: nhật bình xanh ngọc x2 ngày
  ('00000000-0000-0000-0005-000000000002',
   '00000000-0000-0000-0003-000000000005',
   '00000000-0000-0000-0004-000000000009',
   550000, 1500000),

  -- Booking 3: váy cưới + vest đen x2 ngày
  ('00000000-0000-0000-0005-000000000003',
   '00000000-0000-0000-0003-000000000007',
   '00000000-0000-0000-0004-000000000012',
   900000, 3000000),
  ('00000000-0000-0000-0005-000000000003',
   '00000000-0000-0000-0003-000000000008',
   '00000000-0000-0000-0004-000000000014',
   450000, 1500000),

  -- Booking 4: áo dài hồng x1 ngày
  ('00000000-0000-0000-0005-000000000004',
   '00000000-0000-0000-0003-000000000004',
   '00000000-0000-0000-0004-000000000008',
   300000, 850000),

  -- Booking 5: áo tấc nâu x2 ngày (đã huỷ)
  ('00000000-0000-0000-0005-000000000005',
   '00000000-0000-0000-0003-000000000006',
   '00000000-0000-0000-0004-000000000011',
   480000, 1200000)

on conflict do nothing;

-- ------------------------------------------------------------
-- 11. BOOKING STATUS HISTORY
-- ------------------------------------------------------------
insert into public.booking_status_history
  (booking_id, from_status, to_status, changed_by, note) values

  -- Booking 1: pending → confirmed → paid → renting → returned → completed
  ('00000000-0000-0000-0005-000000000001', null,                    'pending_confirmation', '00000000-0000-0000-0000-000000000010', 'Khách đặt đơn'),
  ('00000000-0000-0000-0005-000000000001', 'pending_confirmation',  'confirmed',            '00000000-0000-0000-0000-000000000002', 'Nhân viên xác nhận'),
  ('00000000-0000-0000-0005-000000000001', 'confirmed',             'paid',                 '00000000-0000-0000-0000-000000000002', 'Khách thanh toán tiền mặt'),
  ('00000000-0000-0000-0005-000000000001', 'paid',                  'renting',              '00000000-0000-0000-0000-000000000002', 'Khách nhận trang phục'),
  ('00000000-0000-0000-0005-000000000001', 'renting',               'returned',             '00000000-0000-0000-0000-000000000002', 'Khách trả đúng hạn'),
  ('00000000-0000-0000-0005-000000000001', 'returned',              'completed',            '00000000-0000-0000-0000-000000000002', 'Kiểm tra OK, hoàn tất'),

  -- Booking 2: đang thuê
  ('00000000-0000-0000-0005-000000000002', null,                    'pending_confirmation', '00000000-0000-0000-0000-000000000010', 'Khách đặt đơn'),
  ('00000000-0000-0000-0005-000000000002', 'pending_confirmation',  'confirmed',            '00000000-0000-0000-0000-000000000002', 'Nhân viên xác nhận'),
  ('00000000-0000-0000-0005-000000000002', 'confirmed',             'paid',                 '00000000-0000-0000-0000-000000000002', 'Chuyển khoản'),
  ('00000000-0000-0000-0005-000000000002', 'paid',                  'renting',              '00000000-0000-0000-0000-000000000002', 'Khách đã nhận'),

  -- Booking 3: confirmed
  ('00000000-0000-0000-0005-000000000003', null,                    'pending_confirmation', '00000000-0000-0000-0000-000000000011', 'Đặt cho đám cưới'),
  ('00000000-0000-0000-0005-000000000003', 'pending_confirmation',  'confirmed',            '00000000-0000-0000-0000-000000000002', 'Xác nhận đơn cưới'),

  -- Booking 4: mới đặt
  ('00000000-0000-0000-0005-000000000004', null,                    'pending_confirmation', '00000000-0000-0000-0000-000000000012', 'Khách đặt online'),

  -- Booking 5: cancelled
  ('00000000-0000-0000-0005-000000000005', null,                    'pending_confirmation', '00000000-0000-0000-0000-000000000011', 'Khách đặt đơn'),
  ('00000000-0000-0000-0005-000000000005', 'pending_confirmation',  'confirmed',            '00000000-0000-0000-0000-000000000002', 'Xác nhận'),
  ('00000000-0000-0000-0005-000000000005', 'confirmed',             'cancelled',            '00000000-0000-0000-0000-000000000011', 'Khách huỷ')

on conflict do nothing;

-- ------------------------------------------------------------
-- 12. PAYMENTS
-- ------------------------------------------------------------
insert into public.payments
  (id, booking_id, provider, amount, status, paid_at) values

  -- Booking 1: đã thanh toán đủ (tiền thuê + cọc)
  ('00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0005-000000000001',
   'cash', 700000, 'paid', '2026-06-01 09:00:00+07'),
  ('00000000-0000-0000-0006-000000000002',
   '00000000-0000-0000-0005-000000000001',
   'cash', 1000000, 'paid', '2026-06-01 09:05:00+07'),

  -- Booking 2: đã trả (chuyển khoản)
  ('00000000-0000-0000-0006-000000000003',
   '00000000-0000-0000-0005-000000000002',
   'bank_transfer', 1100000, 'paid', '2026-06-13 20:00:00+07'),
  ('00000000-0000-0000-0006-000000000004',
   '00000000-0000-0000-0005-000000000002',
   'bank_transfer', 1500000, 'paid', '2026-06-13 20:05:00+07'),

  -- Booking 3: chưa trả
  ('00000000-0000-0000-0006-000000000005',
   '00000000-0000-0000-0005-000000000003',
   'mock', 2700000, 'pending', null),
  ('00000000-0000-0000-0006-000000000006',
   '00000000-0000-0000-0005-000000000003',
   'mock', 4500000, 'pending', null),

  -- Booking 5: hoàn tiền cọc (cancelled)
  ('00000000-0000-0000-0006-000000000007',
   '00000000-0000-0000-0005-000000000005',
   'cash', 1200000, 'refunded', '2026-06-08 14:00:00+07')

on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 13. REFUNDS
-- ------------------------------------------------------------
insert into public.refunds
  (booking_id, payment_id, amount, status, reason) values
  ('00000000-0000-0000-0005-000000000005',
   '00000000-0000-0000-0006-000000000007',
   1200000, 'refunded', 'Hoàn cọc do khách huỷ trước 48h')
on conflict do nothing;

-- ------------------------------------------------------------
-- 14. FINANCIAL TRANSACTIONS
-- ------------------------------------------------------------
insert into public.financial_transactions
  (booking_id, payment_id, transaction_type, amount, note) values

  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0006-000000000001', 'rental_payment',   700000,  'Thu tiền thuê booking 1'),
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0006-000000000002', 'deposit_received', 1000000, 'Thu tiền cọc booking 1'),
  ('00000000-0000-0000-0005-000000000001', null,                                   'deposit_returned',  1000000, 'Hoàn cọc khi trả đồ OK'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0006-000000000003', 'rental_payment',   1100000, 'Thu tiền thuê booking 2'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0006-000000000004', 'deposit_received', 1500000, 'Thu tiền cọc booking 2'),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0006-000000000007', 'deposit_refund',   1200000, 'Hoàn cọc do khách huỷ')

on conflict do nothing;

-- ------------------------------------------------------------
-- 15. INSPECTION SESSIONS (cho booking 1 đã hoàn thành)
-- ------------------------------------------------------------
insert into public.inspection_sessions
  (id, booking_id, garment_asset_id, status, inspected_by, note, completed_at) values
  ('00000000-0000-0000-0007-000000000001',
   '00000000-0000-0000-0005-000000000001',
   '00000000-0000-0000-0004-000000000001',
   'completed',
   '00000000-0000-0000-0000-000000000002',
   'Kiểm tra sau khi khách trả: trang phục sạch, không hư hại',
   '2026-06-03 16:00:00+07')
on conflict (id) do nothing;

insert into public.inspection_findings
  (inspection_session_id, finding_type, severity, description, penalty_amount) values
  ('00000000-0000-0000-0007-000000000001', 'no_damage', 'low', 'Không phát hiện hư hại', 0)
on conflict do nothing;

-- ------------------------------------------------------------
-- 16. LAUNDRY TICKETS
-- ------------------------------------------------------------
insert into public.laundry_tickets
  (garment_asset_id, booking_id, status, note, completed_at) values

  -- Sau booking 1 hoàn thành
  ('00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0005-000000000001',
   'completed', 'Giặt khô sau thuê', '2026-06-04 10:00:00+07'),

  -- Asset đang giặt sau booking khác
  ('00000000-0000-0000-0004-000000000007',
   null,
   'open', 'Giặt định kỳ', null)

on conflict do nothing;

-- ------------------------------------------------------------
-- 17. MAINTENANCE JOBS
-- ------------------------------------------------------------
insert into public.maintenance_jobs
  (garment_asset_id, status, note) values
  ('00000000-0000-0000-0004-000000000003',
   'in_progress', 'Sửa chỉ thêu bị sổ ở gấu áo')
on conflict do nothing;

-- ------------------------------------------------------------
-- 18. TRYON REQUESTS
-- ------------------------------------------------------------
insert into public.tryon_requests
  (customer_id, garment_id, status, consent_accepted) values
  ('00000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0003-000000000001',
   'completed', true),
  ('00000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0003-000000000003',
   'pending', true)
on conflict do nothing;

-- ------------------------------------------------------------
-- 19. NOTIFICATIONS
-- ------------------------------------------------------------
insert into public.notifications (user_id, title, body) values
  ('00000000-0000-0000-0000-000000000010',
   'Đơn thuê đã hoàn thành',
   'Đơn thuê #BK0001 của bạn đã được hoàn tất. Cảm ơn bạn đã sử dụng dịch vụ!'),
  ('00000000-0000-0000-0000-000000000010',
   'Đang cho thuê',
   'Bạn đang thuê Nhật Bình xanh ngọc. Hạn trả: 16/06/2026.'),
  ('00000000-0000-0000-0000-000000000011',
   'Đơn thuê đã xác nhận',
   'Đơn thuê váy cưới và vest của bạn đã được xác nhận. Chúng tôi sẽ giao vào 20/06/2026.'),
  ('00000000-0000-0000-0000-000000000011',
   'Đơn thuê bị huỷ',
   'Đơn thuê áo tấc nâu trầm đã được huỷ theo yêu cầu của bạn.')
on conflict do nothing;

-- ------------------------------------------------------------
-- 20. AUDIT LOGS
-- ------------------------------------------------------------
insert into public.audit_logs
  (actor_id, action, entity_type, entity_id, metadata) values
  ('00000000-0000-0000-0000-000000000002', 'UPDATE_STATUS', 'booking',
   '00000000-0000-0000-0005-000000000001',
   '{"from":"returned","to":"completed"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'CREATE_INSPECTION', 'inspection_session',
   '00000000-0000-0000-0007-000000000001',
   '{"booking_id":"00000000-0000-0000-0005-000000000001"}'::jsonb),
  ('00000000-0000-0000-0000-000000000011', 'CANCEL_BOOKING', 'booking',
   '00000000-0000-0000-0005-000000000005',
   '{"reason":"Khách huỷ vì bận việc đột xuất"}'::jsonb)
on conflict do nothing;

-- ------------------------------------------------------------
-- 21. SYSTEM SETTINGS
-- ------------------------------------------------------------
insert into public.system_settings (key, value) values
  ('max_rental_days',         '{"value": 30}'::jsonb),
  ('deposit_refund_window_h', '{"value": 48}'::jsonb),
  ('late_penalty_per_day',    '{"value": 200000}'::jsonb),
  ('store_address',           '{"value": "123 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM"}'::jsonb),
  ('store_phone',             '{"value": "0901999888"}'::jsonb),
  ('business_hours',          '{"open": "08:00", "close": "20:00", "days": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

commit;
