-- ============================================================
-- Migration: Thêm bảng garment_sizes để tách Style và Size
-- ============================================================

-- 1. Tạo bảng garment_sizes
CREATE TABLE IF NOT EXISTS public.garment_sizes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garment_id    UUID NOT NULL REFERENCES public.garments(id) ON DELETE CASCADE,
  size_label    VARCHAR,
  daily_price   DECIMAL(12, 2) DEFAULT 0,
  deposit_amount DECIMAL(12, 2) DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ(6) DEFAULT now(),
  UNIQUE(garment_id, size_label)
);

-- 2. Migrate dữ liệu từ garments sang garment_sizes
--    Mỗi garment hiện có → 1 row trong garment_sizes
INSERT INTO public.garment_sizes (garment_id, size_label, daily_price, deposit_amount)
SELECT id, size_label, daily_price, deposit_amount
FROM public.garments
WHERE is_active = true
  AND NOT EXISTS (SELECT 1 FROM public.garment_sizes gs WHERE gs.garment_id = garments.id);

-- 3. Thêm cột garment_size_id vào garment_assets
ALTER TABLE public.garment_assets
ADD COLUMN IF NOT EXISTS garment_size_id UUID REFERENCES public.garment_sizes(id);

-- 4. Link garment_assets → garment_sizes (dựa vào garment_id)
UPDATE public.garment_assets ga
SET garment_size_id = gs.id
FROM public.garment_sizes gs
WHERE ga.garment_id = gs.garment_id
  AND ga.garment_size_id IS NULL;

-- 5. Thêm cột garment_size_id vào booking_items
ALTER TABLE public.booking_items
ADD COLUMN IF NOT EXISTS garment_size_id UUID REFERENCES public.garment_sizes(id);

-- 6. Link booking_items → garment_sizes (dựa vào garment_id)
UPDATE public.booking_items bi
SET garment_size_id = gs.id
FROM public.garment_sizes gs
WHERE bi.garment_id = gs.garment_id
  AND bi.garment_size_id IS NULL;

-- 7. Xóa các cột đã migrate khỏi garments
--    (daily_price, deposit_amount, size_label đã chuyển sang garment_sizes)
ALTER TABLE public.garments
DROP COLUMN IF EXISTS size_label,
DROP COLUMN IF EXISTS daily_price,
DROP COLUMN IF EXISTS deposit_amount;
