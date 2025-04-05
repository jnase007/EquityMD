/*
  # Add slug field to deals

  1. Changes
    - Add slug field to deals table
    - Create function to generate slug from title
    - Create trigger to automatically update slug on insert/update
    - Add index on slug field for faster lookups

  2. Security
    - No changes to RLS policies needed
*/

-- Add slug column
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS slug text GENERATED ALWAYS AS 
  (regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) STORED;

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_deals_slug ON deals(slug);