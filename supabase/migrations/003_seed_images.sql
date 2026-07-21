-- ============================================================
-- Migration: Thêm ảnh cho sản phẩm
-- Bạn thay URL bên dưới bằng URL ảnh thật của mình
-- ============================================================

-- Cách 1: Dùng ảnh mẫu Unsplash (miễn phí, demo)
-- Sau này thay bằng ảnh thật của bạn

-- Áo dài đỏ thêu sen
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1600054904350-e85b04888c5f?w=800', 'Áo dài đỏ thêu sen - mặt trước', 1
FROM public.garments WHERE name = 'Áo dài đỏ thêu sen' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Áo dài hồng pastel
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1590507625372-28a6a8c48669?w=800', 'Áo dài hồng pastel - mặt trước', 1
FROM public.garments WHERE name = 'Áo dài hồng pastel' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Áo dài tím hoa cúc
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', 'Áo dài tím hoa cúc - mặt trước', 1
FROM public.garments WHERE name = 'Áo dài tím hoa cúc' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Áo dài trắng lụa mềm
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1612336464435-7d5656981104?w=800', 'Áo dài trắng lụa mềm - mặt trước', 1
FROM public.garments WHERE name = 'Áo dài trắng lụa mềm' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Áo dài xanh ngọc thêu hoa
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1612532273430-3f4c1c7c4e0d?w=800', 'Áo dài xanh ngọc thêu hoa - mặt trước', 1
FROM public.garments WHERE name = 'Áo dài xanh ngọc thêu hoa' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Áo Tấc nâu trầm
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', 'Áo Tấc nâu trầm - mặt trước', 1
FROM public.garments WHERE name = 'Áo Tấc nâu trầm' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Ngũ Thân tím than
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1612532273430-3f4c1c7c4e0d?w=800', 'Ngũ Thân tím than - mặt trước', 1
FROM public.garments WHERE name = 'Ngũ Thân tím than' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Nhật Bình xanh ngọc
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1590507625372-28a6a8c48669?w=800', 'Nhật Bình xanh ngọc - mặt trước', 1
FROM public.garments WHERE name = 'Nhật Bình xanh ngọc' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Váy cưới xòe trắng
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1594552072238-5c4a26f10bf2?w=800', 'Váy cưới xòe trắng - mặt trước', 1
FROM public.garments WHERE name = 'Váy cưới xòe trắng đính đá' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Vest đen 3 mảnh
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'Vest đen 3 mảnh - mặt trước', 1
FROM public.garments WHERE name = 'Vest đen 3 mảnh nam' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Ao dai do theu sen (không dấu)
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1600054904350-e85b04888c5f?w=800', 'Ao dai do theu sen', 1
FROM public.garments WHERE name = 'Ao dai do theu sen' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Ao dai trang lua mem (không dấu)
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1612336464435-7d5656981104?w=800', 'Ao dai trang lua mem', 1
FROM public.garments WHERE name = 'Ao dai trang lua mem' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Nhat Binh xanh ngoc (không dấu)
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1590507625372-28a6a8c48669?w=800', 'Nhat Binh xanh ngoc', 1
FROM public.garments WHERE name = 'Nhat Binh xanh ngoc' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);

-- Ao Tac nau tram (không dấu)
INSERT INTO public.garment_images (garment_id, image_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', 'Ao Tac nau tram', 1
FROM public.garments WHERE name = 'Ao Tac nau tram' AND NOT EXISTS (SELECT 1 FROM public.garment_images WHERE garment_id = id);
