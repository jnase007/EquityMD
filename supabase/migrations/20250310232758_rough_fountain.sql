/*
  # Fix Profile Policies

  1. Changes
    - Remove circular references in profile policies
    - Simplify admin access checks
    - Add proper user and admin policies

  2. Security
    - Maintain RLS protection
    - Ensure proper access control
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new simplified policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    is_admin = true
    OR
    auth.uid() = id
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    is_admin = true
    OR
    auth.uid() = id
  )
  WITH CHECK (
    is_admin = true
    OR
    auth.uid() = id
  );

-- Add policy for investor profiles
CREATE POLICY "Public can view investor profiles"
  ON investor_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own investor profile"
  ON investor_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);