-- AI Try-on upgrade (already applied manually in Supabase)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tryon_category') THEN
    CREATE TYPE tryon_category AS ENUM ('upper_body', 'lower_body', 'dresses');
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tryon_category') THEN
    CREATE TYPE tryon_category AS ENUM ('upper_body', 'lower_body', 'dresses');
  END IF;
END$$;

ALTER TABLE garment_categories
  ADD COLUMN IF NOT EXISTS tryon_category try

ALTER TABLE garments
  ADD COLUMN IF NOT EXISTS tryon_reference_ur

ALTER TABLE tryon_requests
  ADD COLUMN IF NOT EXISTS mode text,
  ADD COLUMN IF NOT EXISTS replicate_predicti
  ADD COLUMN IF NOT EXISTS error_message text;

CREATE UNIQUE INDEX IF NOT EXISTS tryon_requests_replicate_prediction_id_key
  ON tryon_requests (replicate_prediction_id)

ALTER TABLE tryon_results
  ADD COLUMN IF NOT EXISTS stored_image_url t

UPDATE garment_categories SET tryon_category = 'dresses'
WHERE tryon_category IS NULL AND (
  lower(name) LIKE '%áo dài%' OR lower(name) LIKE '%ao dai%'
  OR lower(name) LIKE '%váy%' OR lower(name) LIKE '%đầm%'
  OR lower(name) LIKE '%dress%'
);

UPDATE garment_categories SET tryon_category = 'upper_body'
WHERE tryon_category IS NULL AND (
  lower(name) LIKE '%áo%' OR lower(name) LIKE '%vest%'
  OR lower(name) LIKE '%shirt%' OR lower(name) LIKE '%jacket%'
);

UPDATE garment_categories SET tryon_category = 'lower_body'
WHERE tryon_category IS NULL AND (
  lower(name) LIKE '%quần%' OR lower(name) LI
  OR lower(name) LIKE '%pants%' OR lower(name) LIKE '%skirt%'
);

UPDATE garment_categories
SET tryon_category = 'dresses'
WHERE tryon_category IS NULL
  AND (name ILIKE '%cổ phục%' OR name ILIKE '%co phuc%');

UPDATE garments
SET category_id = '00000000-0000-0000-0001-000000000001'
WHERE id = '6bb3030f-16fb-4ddb-9cc3-8fd3bad58601';
