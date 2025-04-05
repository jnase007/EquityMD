-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- First delete existing admin records in correct order to avoid FK constraints
  DELETE FROM public.syndicator_profiles
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@equitymd.com');
  
  DELETE FROM public.profiles
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@equitymd.com');
  
  DELETE FROM auth.users
  WHERE email = 'admin@equitymd.com';

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
END $$;