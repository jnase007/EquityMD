-- Add dashboard_preference column to profiles table
-- This allows users to choose their default dashboard view (investor or syndicator)
-- Since the platform is unified, users can switch between views anytime

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dashboard_preference TEXT 
CHECK (dashboard_preference IN ('investor', 'syndicator'));

-- Set default preference based on existing user_type for current users
UPDATE profiles 
SET dashboard_preference = user_type 
WHERE dashboard_preference IS NULL AND user_type IS NOT NULL;

-- Default new users to investor view
UPDATE profiles 
SET dashboard_preference = 'investor' 
WHERE dashboard_preference IS NULL;

COMMENT ON COLUMN profiles.dashboard_preference IS 'User preferred dashboard view: investor or syndicator. Can be changed anytime.';

