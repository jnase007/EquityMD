-- Add LinkedIn URL column to investor_profiles table
ALTER TABLE investor_profiles 
ADD COLUMN linkedin_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN investor_profiles.linkedin_url IS 'LinkedIn profile URL for the investor'; 