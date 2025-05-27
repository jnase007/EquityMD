-- Add justin@brandastic.com as admin user for Google OAuth
-- This allows Google authentication to work for the admin user

-- First, ensure is_admin column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Update any existing profile for justin@brandastic.com to be admin
UPDATE profiles 
SET is_admin = true, 
    user_type = 'syndicator',
    is_verified = true
WHERE email = 'justin@brandastic.com';

-- If no profile exists, we'll let the app create it on first Google login
-- The app will automatically create the profile when Justin signs in with Google

-- Create a function to automatically make justin@brandastic.com admin on profile creation
CREATE OR REPLACE FUNCTION make_justin_admin()
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

-- Create trigger to automatically make justin@brandastic.com admin
DROP TRIGGER IF EXISTS auto_make_justin_admin ON profiles;
CREATE TRIGGER auto_make_justin_admin
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION make_justin_admin();

-- Also ensure admin policies allow justin@brandastic.com access
-- Update existing admin policies to include email-based admin check
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) OR  -- Users can view their own profile
    (is_admin = true) OR  -- Admin users can view all profiles
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'justin@brandastic.com'
    ))
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = id) OR  -- Users can update their own profile
    (is_admin = true) OR  -- Admin users can update all profiles
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'justin@brandastic.com'
    ))
  )
  WITH CHECK (
    (auth.uid() = id) OR
    (is_admin = true) OR
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'justin@brandastic.com'
    ))
  ); 