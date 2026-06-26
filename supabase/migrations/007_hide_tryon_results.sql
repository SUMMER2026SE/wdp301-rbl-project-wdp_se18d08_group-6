-- Hide bad AI try-on results from customer history without deleting data/storage.

ALTER TABLE tryon_results
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz;
