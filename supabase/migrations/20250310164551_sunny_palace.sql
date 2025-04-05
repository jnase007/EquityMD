/*
  # Add Admin Support and Create Admin User

  1. Changes
    - Adds is_admin column to profiles table
    - Creates admin user with proper authentication
    - Sets up admin profile

  2. Security
    - Admin user has full access to manage users
    - Password should be changed after first login
*/

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

-- Create admin user in auth schema
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@equitymd.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
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