-- Add is_admin column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create admin user in auth.users
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  raw_app_meta_data,
  aud,
  role,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@equitymd.com',
  '{"provider":"email"}',
  '{"provider":"email","providers":["email"]}',
  'authenticated',
  'authenticated',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

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
  '11111111-1111-1111-1111-111111111111',
  'admin@equitymd.com',
  'System Administrator',
  'investor',
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;
