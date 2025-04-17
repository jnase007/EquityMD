-- Add location fields
ALTER TABLE syndicator_profiles
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city text;

-- Add indexes for location searches
CREATE INDEX IF NOT EXISTS idx_syndicator_profiles_state ON syndicator_profiles(state);
CREATE INDEX IF NOT EXISTS idx_syndicator_profiles_city ON syndicator_profiles(city);
;
