/*
  # Implement SEO-Friendly URLs

  1. Changes
    - Adds slug columns to deals and syndicator_profiles tables
    - Configures slugs as generated columns based on title/company_name
    - Creates indexes for efficient slug lookups

  2. Benefits
    - Improves SEO with human-readable URLs
    - Automatically maintains slugs when titles change
    - Ensures URL consistency
    - Enables faster URL-based lookups
*/

-- Add generated slug column to deals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'slug'
  ) THEN
    ALTER TABLE deals ADD COLUMN slug text GENERATED ALWAYS AS (
      regexp_replace(
        lower(title),
        '[^a-z0-9]+',
        '-',
        'g'
      )
    ) STORED;

    CREATE INDEX idx_deals_slug ON deals(slug);
  END IF;
END $$;

-- Add generated slug column to syndicator_profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'syndicator_profiles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE syndicator_profiles ADD COLUMN slug text GENERATED ALWAYS AS (
      regexp_replace(
        lower(company_name),
        '[^a-z0-9]+',
        '-',
        'g'
      )
    ) STORED;

    CREATE INDEX idx_syndicator_profiles_slug ON syndicator_profiles(slug);
  END IF;
END $$;