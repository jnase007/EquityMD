-- Add slug column
ALTER TABLE syndicator_profiles 
ADD COLUMN IF NOT EXISTS slug text GENERATED ALWAYS AS 
  (regexp_replace(lower(company_name), '[^a-z0-9]+', '-', 'g')) STORED;

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_syndicator_profiles_slug ON syndicator_profiles(slug);
;
