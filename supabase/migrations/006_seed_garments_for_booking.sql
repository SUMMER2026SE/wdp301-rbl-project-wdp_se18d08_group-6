-- ============================================================
-- 006_seed_garments_for_booking.sql
-- Seed danh mục trang phục để test chức năng booking.
-- Chạy sau: 001_initial_schema.sql + 004_restore_missing_objects.sql
-- Tất cả asset đều ở trạng thái 'available'.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
insert into public.garment_categories (id, name, description, is_active) values
  ('00000000-0000-0000-0001-000000000001', 'Áo dài truyền thống', 'Áo dài lụa thêu tay, phong cách cổ điển', true),
  ('00000000-0000-0000-0001-000000000002', 'Áo dài cách tân',     'Áo dài hiện đại, phù hợp chụp ảnh & sự kiện', true),
  ('00000000-0000-0000-0001-000000000003', 'Cổ phục',             'Nhật Bình, Áo Tấc, Ngũ Thân cổ phục Việt Nam', true),
  ('00000000-0000-0000-0001-000000000004', 'Váy cưới',            'Váy cưới và phụ kiện cưới cao cấp', true),
  ('00000000-0000-0000-0001-000000000005', 'Vest & Suit',         'Vest nam, suit nữ cho sự kiện trang trọng', true)
on conflict (name) do nothing;

-- ------------------------------------------------------------
-- GARMENTS (10 bộ trang phục)
-- ------------------------------------------------------------
insert into public.garments
  (id, category_id, name, description, size_label, color, daily_price, deposit_amount, is_active) values

  -- Áo dài truyền thống
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Áo dài đỏ thêu sen',
   'Áo dài đỏ thắm với hoạ tiết sen nổi bật, vải lụa tơ tằm cao cấp. Phù hợp lễ Tết, đám cưới.',
   'M', 'Đỏ', 350000, 1000000, true),

  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001',
   'Áo dài xanh ngọc thêu hoa',
   'Áo dài xanh ngọc thêu hoa văn tinh tế, phong cách quý phái.',
   'S', 'Xanh ngọc', 380000, 1100000, true),

  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'Áo dài tím hoa cúc',
   'Áo dài tím pastel in hoa cúc nổi, chất liệu gấm nhẹ.',
   'L', 'Tím', 360000, 1050000, true),

  -- Áo dài cách tân
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000002',
   'Áo dài trắng lụa mềm',
   'Áo dài cách tân trắng tinh, chất liệu lụa nhẹ mềm mại. Lý tưởng chụp ảnh ngoài trời.',
   'S-M', 'Trắng', 320000, 900000, true),

  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000002',
   'Áo dài hồng pastel',
   'Áo dài cách tân tông hồng nhẹ nhàng, trẻ trung. Phù hợp sinh nhật, kỷ yếu.',
   'S', 'Hồng pastel', 300000, 850000, true),

  -- Cổ phục
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000003',
   'Nhật Bình xanh ngọc',
   'Bộ Nhật Bình xanh ngọc đầy đủ phụ kiện: mấn, thắt lưng, vòng cổ phong cách hoàng gia.',
   'S-M', 'Xanh ngọc', 550000, 1500000, true),

  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000003',
   'Áo Tấc nâu trầm',
   'Áo Tấc tông nâu trầm sang trọng, chụp ảnh cổ trang hoặc lễ hội dân gian.',
   'L', 'Nâu', 480000, 1200000, true),

  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000003',
   'Ngũ Thân tím than',
   'Bộ Ngũ Thân nam tím than cổ kính. Kèm khăn đóng và phụ kiện.',
   'M-L', 'Tím than', 500000, 1400000, true),

  -- Váy cưới
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000004',
   'Váy cưới xòe trắng đính đá',
   'Váy cưới xòe công chúa, đính đá pha lê, vải tulle 7 lớp. Sang trọng tối đa.',
   'S-M', 'Trắng', 900000, 3000000, true),

  -- Vest & Suit
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000005',
   'Vest đen 3 mảnh nam',
   'Vest đen 3 mảnh cao cấp: áo vest, vest trong, quần. Dành cho chú rể và sự kiện trang trọng.',
   'L', 'Đen', 450000, 1500000, true)

on conflict (id) do nothing;

-- ------------------------------------------------------------
-- GARMENT ASSETS
-- Mỗi trang phục có 3 asset đều sẵn sàng (available) để test booking.
-- ------------------------------------------------------------
insert into public.garment_assets
  (garment_id, asset_code, status, condition_note, purchase_cost) values

  -- Áo dài đỏ thêu sen
  ('00000000-0000-0000-0002-000000000001', 'ADO-001-A', 'available', 'Mới 100%', 2500000),
  ('00000000-0000-0000-0002-000000000001', 'ADO-001-B', 'available', 'Tốt, đã giặt ủi', 2500000),
  ('00000000-0000-0000-0002-000000000001', 'ADO-001-C', 'available', 'Tốt', 2500000),

  -- Áo dài xanh ngọc
  ('00000000-0000-0000-0002-000000000002', 'ADX-002-A', 'available', 'Mới 100%', 2800000),
  ('00000000-0000-0000-0002-000000000002', 'ADX-002-B', 'available', 'Tốt', 2800000),
  ('00000000-0000-0000-0002-000000000002', 'ADX-002-C', 'available', 'Tốt', 2800000),

  -- Áo dài tím hoa cúc
  ('00000000-0000-0000-0002-000000000003', 'ADT-003-A', 'available', 'Tốt', 2600000),
  ('00000000-0000-0000-0002-000000000003', 'ADT-003-B', 'available', 'Tốt', 2600000),
  ('00000000-0000-0000-0002-000000000003', 'ADT-003-C', 'available', 'Mới 100%', 2600000),

  -- Áo dài trắng lụa mềm
  ('00000000-0000-0000-0002-000000000004', 'ADL-004-A', 'available', 'Mới 100%', 2200000),
  ('00000000-0000-0000-0002-000000000004', 'ADL-004-B', 'available', 'Tốt', 2200000),
  ('00000000-0000-0000-0002-000000000004', 'ADL-004-C', 'available', 'Tốt', 2200000),

  -- Áo dài hồng pastel
  ('00000000-0000-0000-0002-000000000005', 'ADH-005-A', 'available', 'Mới 100%', 2000000),
  ('00000000-0000-0000-0002-000000000005', 'ADH-005-B', 'available', 'Tốt', 2000000),
  ('00000000-0000-0000-0002-000000000005', 'ADH-005-C', 'available', 'Tốt', 2000000),

  -- Nhật Bình xanh ngọc
  ('00000000-0000-0000-0002-000000000006', 'NBX-006-A', 'available', 'Mới 100%', 5000000),
  ('00000000-0000-0000-0002-000000000006', 'NBX-006-B', 'available', 'Tốt', 5000000),
  ('00000000-0000-0000-0002-000000000006', 'NBX-006-C', 'available', 'Tốt', 5000000),

  -- Áo Tấc nâu trầm
  ('00000000-0000-0000-0002-000000000007', 'ATN-007-A', 'available', 'Mới 100%', 4000000),
  ('00000000-0000-0000-0002-000000000007', 'ATN-007-B', 'available', 'Tốt', 4000000),
  ('00000000-0000-0000-0002-000000000007', 'ATN-007-C', 'available', 'Tốt', 4000000),

  -- Ngũ Thân tím than
  ('00000000-0000-0000-0002-000000000008', 'NGT-008-A', 'available', 'Mới 100%', 4500000),
  ('00000000-0000-0000-0002-000000000008', 'NGT-008-B', 'available', 'Tốt', 4500000),
  ('00000000-0000-0000-0002-000000000008', 'NGT-008-C', 'available', 'Tốt', 4500000),

  -- Váy cưới xòe trắng
  ('00000000-0000-0000-0002-000000000009', 'VCT-009-A', 'available', 'Mới 100%', 15000000),
  ('00000000-0000-0000-0002-000000000009', 'VCT-009-B', 'available', 'Tốt', 15000000),
  ('00000000-0000-0000-0002-000000000009', 'VCT-009-C', 'available', 'Tốt', 15000000),

  -- Vest đen 3 mảnh
  ('00000000-0000-0000-0002-000000000010', 'VDB-010-A', 'available', 'Mới 100%', 6000000),
  ('00000000-0000-0000-0002-000000000010', 'VDB-010-B', 'available', 'Tốt', 6000000),
  ('00000000-0000-0000-0002-000000000010', 'VDB-010-C', 'available', 'Tốt', 6000000)

on conflict (asset_code) do nothing;

commit;

-- Bỏ comment để kiểm tra kết quả:
-- select g.name, g.size_label, g.daily_price, g.deposit_amount,
--        count(a.id) as total_assets
-- from public.garments g
-- left join public.garment_assets a on a.garment_id = g.id
-- group by g.id, g.name, g.size_label, g.daily_price, g.deposit_amount
-- order by g.daily_price;
