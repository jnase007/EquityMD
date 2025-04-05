/*
  # Create Admin User with Proper Authentication

  1. Changes
    - Creates admin user with correct password hashing
    - Sets up admin profile and privileges
    - Creates associated syndicator profile

  2. Security
    - Uses proper password encryption
    - Sets admin privileges through profiles table
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin user if not exists
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- First check if admin already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@equitymd.com'
  ) THEN
    -- Generate new UUID for admin
    SELECT gen_random_uuid() INTO admin_id;
    
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
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      ''
    );

    -- Create profile
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
  END IF;
END $$;