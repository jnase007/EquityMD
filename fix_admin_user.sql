-- Fix Admin User Access for justin@brandastic.com
-- Run this in Supabase SQL Editor to immediately grant admin access

-- First, ensure is_admin column exists in profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Update the profile for justin@brandastic.com to be admin
UPDATE profiles 
SET 
  is_admin = true,
  user_type = 'syndicator',
  is_verified = true
WHERE email = 'justin@brandastic.com';

-- If the profile doesn't exist yet, insert it
-- This covers the case where Justin hasn't signed up yet
INSERT INTO profiles (id, email, is_admin, user_type, is_verified, full_name)
SELECT 
  auth.users.id,
  'justin@brandastic.com',
  true,
  'syndicator',
  true,
  COALESCE(auth.users.raw_user_meta_data->>'full_name', 'Justin Nassie')
FROM auth.users 
WHERE auth.users.email = 'justin@brandastic.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'justin@brandastic.com'
  );

-- Create trigger function to automatically make justin@brandastic.com admin
CREATE OR REPLACE FUNCTION auto_make_justin_admin()
RETURNS trigger AS $$
BEGIN
  -- If the email is justin@brandastic.com, make them admin
  IF NEW.email = 'justin@brandastic.com' THEN
    NEW.is_admin = true;
    NEW.user_type = 'syndicator';
    NEW.is_verified = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign admin on profile creation/update
DROP TRIGGER IF EXISTS make_justin_admin_trigger ON profiles;
CREATE TRIGGER make_justin_admin_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_make_justin_admin();

-- Verify the update worked
SELECT id, email, is_admin, user_type, is_verified, full_name
FROM profiles 
WHERE email = 'justin@brandastic.com';

-- Also check if the user exists in auth.users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'justin@brandastic.com';

COMMENT ON COLUMN profiles.is_admin IS 'Admin flag for justin@brandastic.com user access'; 