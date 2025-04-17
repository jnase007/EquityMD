-- Add slug column
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS slug text GENERATED ALWAYS AS 
  (regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) STORED;

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_deals_slug ON deals(slug);
;
