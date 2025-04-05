/*
  # Create admin user

  1. New Data
    - Creates admin user in auth.users
    - Creates admin profile in profiles table
    - Sets admin privileges

  2. Security
    - Admin user has elevated permissions
    - Profile linked to auth user
    - Proper password hashing
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
DECLARE
  admin_id uuid := uuid_generate_v4();
BEGIN
  -- First check if admin already exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@equitymd.com';

  -- Create admin user in auth.users if doesn't exist
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@equitymd.com',
      -- Use proper password hashing function from auth.user_passwords
      (SELECT hash_password('Admin123!')),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      '{}',
      'authenticated',
      'authenticated',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- Create admin profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    is_verified,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    admin_id,
    'admin@equitymd.com',
    'Admin User',
    'syndicator',
    true,
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create syndicator profile for admin
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
  )
  ON CONFLICT (id) DO NOTHING;
END $$;