-- Test Admin Policies for Profile Updates
-- Run this in Supabase SQL Editor to fix admin update issues

-- First, let's check current policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Drop any conflicting policies that might block admin updates
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create comprehensive policy that allows both self-updates and admin updates
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

-- Also ensure the select policy allows admin access
DROP POLICY IF EXISTS "Enable select for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable select for users and admins" ON profiles;

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

-- Verify the policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname IN ('Enable update for users and admins', 'Enable select for users and admins')
ORDER BY policyname;

-- Test the update functionality (replace with actual user ID)
-- UPDATE profiles SET is_admin = false WHERE email = 'jordannassie@gmail.com';

-- Check if the update worked
-- SELECT id, email, full_name, is_admin FROM profiles WHERE email = 'jordannassie@gmail.com'; 