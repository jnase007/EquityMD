/*
  # Add slug field to syndicator profiles

  1. Changes
    - Add slug field to syndicator_profiles table
    - Create function to generate slug from company name
    - Create trigger to automatically update slug on insert/update
    - Add index on slug field for faster lookups

  2. Security
    - No changes to RLS policies needed
*/

-- Add slug column
ALTER TABLE syndicator_profiles 
ADD COLUMN IF NOT EXISTS slug text GENERATED ALWAYS AS 
  (regexp_replace(lower(company_name), '[^a-z0-9]+', '-', 'g')) STORED;

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_syndicator_profiles_slug ON syndicator_profiles(slug);