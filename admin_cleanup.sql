-- Admin Cleanup Script
-- Remove admin access from all users except authorized admins
-- Run this in Supabase SQL Editor

-- First, let's see who currently has admin access
SELECT id, email, full_name, is_admin, user_type, created_at
FROM profiles 
WHERE is_admin = true
ORDER BY created_at DESC;

-- Remove admin access from ALL users first
UPDATE profiles 
SET is_admin = false 
WHERE is_admin = true;

-- Grant admin access ONLY to authorized users
UPDATE profiles 
SET 
  is_admin = true,
  is_verified = true
WHERE email IN ('justin@brandastic.com', 'codeguruevil666@gmail.com');

-- Verify the changes - should only show 2 admins
SELECT id, email, full_name, is_admin, user_type, created_at
FROM profiles 
WHERE is_admin = true
ORDER BY email;

-- Show count of admins (should be 2)
SELECT 
  COUNT(*) as total_admins,
  string_agg(email, ', ') as admin_emails
FROM profiles 
WHERE is_admin = true; 