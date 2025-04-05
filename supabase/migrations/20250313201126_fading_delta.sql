/*
  # Fix Admin Authentication

  1. Changes
    - Drop existing admin user and recreate with proper authentication
    - Set up admin profile with correct privileges
    - Ensure proper password hashing

  2. Security
    - Use proper password encryption
    - Set admin privileges through profiles table
*/

-- First remove any existing admin records to avoid conflicts
DO $$ 
BEGIN
  -- Delete existing admin records in correct order
  DELETE FROM public.syndicator_profiles
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@equitymd.com');
  
  DELETE FROM public.profiles
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@equitymd.com');
  
  DELETE FROM auth.users
  WHERE email = 'admin@equitymd.com';
END $$;

-- Create admin user with proper authentication
DO $$ 
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@equitymd.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    jsonb_build_object(
      'full_name', 'System Administrator'
    ),
    now(),
    now(),
    '',
    ''
  );

  -- Create admin profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    is_admin,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    admin_id,
    'admin@equitymd.com',
    'System Administrator',
    'syndicator',
    true,
    true,
    now(),
    now()
  );

  -- Create syndicator profile
  INSERT INTO public.syndicator_profiles (
    id,
    company_name,
    company_description,
    created_at,
    updated_at
  ) VALUES (
    admin_id,
    'EQUITYMD Admin',
    'Platform administrator',
    now(),
    now()
  );
END $$;