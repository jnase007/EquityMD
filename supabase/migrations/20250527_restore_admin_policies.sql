-- Restore admin policies for profiles table
-- This fixes the issue where admins can't update other users' profiles

-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create new update policy that allows both users to update their own profiles AND admins to update any profile
CREATE POLICY "Enable update for users and admins"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR  -- Users can update their own profile
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )  -- Admins can update any profile
  )
  WITH CHECK (
    auth.uid() = id OR  -- Users can update their own profile
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )  -- Admins can update any profile
  );

-- Also ensure admins can view all profiles (this might already exist but let's be safe)
DROP POLICY IF EXISTS "Enable select for authenticated users" ON profiles;

CREATE POLICY "Enable select for users and admins"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id OR  -- Users can view their own profile
    auth.role() = 'authenticated' OR  -- Authenticated users can view other profiles
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )  -- Admins can view all profiles
  ); 