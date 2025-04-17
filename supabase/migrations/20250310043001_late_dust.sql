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
