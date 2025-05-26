-- Diagnostic script to check favorites table and policies
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if favorites table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;

-- 2. Check current RLS policies on favorites table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'favorites';

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'favorites';

-- 4. Check if there are any existing favorites (should be empty or very few)
SELECT COUNT(*) as total_favorites FROM favorites;

-- 5. Check profiles table structure to verify user_type field
SELECT DISTINCT user_type 
FROM profiles 
WHERE user_type IS NOT NULL;

-- 6. Test query to see what the current user's profile looks like
-- (This will only work when run by an authenticated user)
SELECT 
    id,
    email,
    user_type,
    created_at
FROM profiles 
WHERE id = auth.uid(); 