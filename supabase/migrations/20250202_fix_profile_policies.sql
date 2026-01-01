-- Fix RLS policies for profiles and investor_profiles tables
-- This ensures users can update their own profiles

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (for syndicator directories, etc.)
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- INVESTOR_PROFILES TABLE POLICIES  
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own investor profile" ON investor_profiles;
DROP POLICY IF EXISTS "Users can update own investor profile" ON investor_profiles;
DROP POLICY IF EXISTS "Users can insert own investor profile" ON investor_profiles;

-- Enable RLS
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own investor profile
CREATE POLICY "Users can view own investor profile" ON investor_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own investor profile
CREATE POLICY "Users can update own investor profile" ON investor_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own investor profile
CREATE POLICY "Users can insert own investor profile" ON investor_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- SYNDICATOR_PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own syndicator profile" ON syndicator_profiles;
DROP POLICY IF EXISTS "Users can update own syndicator profile" ON syndicator_profiles;
DROP POLICY IF EXISTS "Users can insert own syndicator profile" ON syndicator_profiles;

-- Enable RLS
ALTER TABLE syndicator_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own syndicator profile
CREATE POLICY "Users can view own syndicator profile" ON syndicator_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own syndicator profile
CREATE POLICY "Users can update own syndicator profile" ON syndicator_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own syndicator profile
CREATE POLICY "Users can insert own syndicator profile" ON syndicator_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- Ensure updated_at column exists on all profile tables
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE investor_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE syndicator_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

