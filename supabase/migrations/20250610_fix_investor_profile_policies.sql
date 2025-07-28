-- Fix RLS policies for investor_profiles table to ensure proper update permissions
-- This migration addresses the "Error updating profile" issue

-- Drop existing policies for investor_profiles
DROP POLICY IF EXISTS "Enable insert for authentication service" ON investor_profiles;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON investor_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON investor_profiles;
DROP POLICY IF EXISTS "Public can view investor profiles" ON investor_profiles;
DROP POLICY IF EXISTS "Users can update own investor profile" ON investor_profiles;

-- Create comprehensive policies for investor_profiles
CREATE POLICY "Enable insert for authentication service"
  ON investor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users"
  ON investor_profiles
  FOR SELECT
  USING (
    auth.uid() = id OR  -- Users can view their own profile
    auth.role() = 'authenticated'  -- Authenticated users can view other profiles
  );

CREATE POLICY "Enable update for users based on id"
  ON investor_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add upsert policy to handle cases where record doesn't exist
CREATE POLICY "Enable upsert for users"
  ON investor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure the table has RLS enabled
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE investor_profiles IS 'Investor-specific profile data with proper RLS policies for user updates'; 