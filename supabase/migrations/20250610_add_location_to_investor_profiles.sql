-- Add location column to investor_profiles table
ALTER TABLE investor_profiles 
ADD COLUMN location TEXT;

-- Add comment to document the column
COMMENT ON COLUMN investor_profiles.location IS 'Investor location (city, state)'; 