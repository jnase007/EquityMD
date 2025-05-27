-- Diagnostic Script for Admin Access Issues
-- Run this to check the current state of justin@brandastic.com admin access

-- 1. Check if user exists in auth.users table
SELECT 'AUTH USERS CHECK' as check_type;
SELECT id, email, email_confirmed_at, created_at, updated_at
FROM auth.users 
WHERE email = 'justin@brandastic.com';

-- 2. Check if profile exists and admin status
SELECT 'PROFILE CHECK' as check_type;
SELECT id, email, is_admin, user_type, is_verified, full_name, created_at, updated_at
FROM profiles 
WHERE email = 'justin@brandastic.com';

-- 3. Check if is_admin column exists
SELECT 'SCHEMA CHECK' as check_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_admin';

-- 4. Check current user (if logged in)
SELECT 'CURRENT USER CHECK' as check_type;
SELECT auth.uid() as current_user_id, auth.email() as current_email;

-- 5. Check profiles table structure
SELECT 'PROFILES TABLE STRUCTURE' as check_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Check for any admin users
SELECT 'ALL ADMIN USERS' as check_type;
SELECT id, email, is_admin, user_type, full_name
FROM profiles 
WHERE is_admin = true;

-- 7. Check RLS policies on profiles table
SELECT 'RLS POLICIES CHECK' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. Check if triggers exist
SELECT 'TRIGGERS CHECK' as check_type;
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
  AND trigger_name LIKE '%justin%' OR trigger_name LIKE '%admin%'; 