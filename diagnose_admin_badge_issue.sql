-- Diagnose and Fix Admin Badge Issue
-- Run these queries in your Supabase SQL Editor

-- 1. Check the role of goequitymd@gmail.com
SELECT 
  p.id,
  p.email,
  p.user_type,
  p.is_admin,
  p.full_name,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'goequitymd@gmail.com';

-- 2. Check all users with admin status (should only be justin@brandastic.com)
SELECT 
  p.id,
  p.email,
  p.user_type,
  p.is_admin,
  p.full_name,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true
ORDER BY p.created_at;

-- 3. Check if there are users with NULL user_type (which might default to admin display)
SELECT 
  p.id,
  p.email,
  p.user_type,
  p.is_admin,
  p.full_name,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.user_type IS NULL
ORDER BY p.created_at;

-- 4. Fix goequitymd@gmail.com specifically
UPDATE profiles 
SET 
  is_admin = false,
  user_type = 'investor'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'goequitymd@gmail.com'
);

-- 5. Fix ALL users who incorrectly have admin status (except justin@brandastic.com)
UPDATE profiles 
SET is_admin = false
WHERE is_admin = true
AND id != (
  SELECT id FROM auth.users WHERE email = 'justin@brandastic.com'
);

-- 6. Ensure all users have a proper user_type
UPDATE profiles 
SET user_type = 'investor'
WHERE user_type IS NULL 
AND is_admin = false;

-- 7. Verification - Check results after fixes
SELECT 
  'After Fix - All Admin Users' as check_type,
  p.email,
  p.user_type,
  p.is_admin
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true;

SELECT 
  'After Fix - goequitymd@gmail.com' as check_type,
  p.email,
  p.user_type,
  p.is_admin
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'goequitymd@gmail.com'; 