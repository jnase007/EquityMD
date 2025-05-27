-- Add verification status to syndicator_profiles table
ALTER TABLE syndicator_profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'premier'));

-- Add last_updated column for tracking verification changes
ALTER TABLE syndicator_profiles 
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();

-- Add accreditation status to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accredited_status BOOLEAN DEFAULT FALSE;

-- Add verification date for accreditation
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;

-- Add accreditation criteria storage
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accreditation_criteria JSONB;

-- Update specific syndicators to Premier status
UPDATE syndicator_profiles 
SET verification_status = 'premier', last_updated = NOW() 
WHERE company_name IN ('Back Bay Capital', 'Sutera Properties', 'Starboard Realty');

-- Create an index for faster verification status queries
CREATE INDEX IF NOT EXISTS idx_syndicator_verification_status ON syndicator_profiles(verification_status);

-- Create an index for faster accreditation queries
CREATE INDEX IF NOT EXISTS idx_profiles_accredited_status ON profiles(accredited_status); 