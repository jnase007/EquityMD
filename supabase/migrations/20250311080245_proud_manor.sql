/*
  # Add Admin User and Policies

  1. Changes
    - Create admin user with email/password
    - Add admin profile
    - Update RLS policies for admin access
*/

-- Create admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@equitymd.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@equitymd.com',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Create admin profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  user_type,
  is_admin,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Admin',
  'syndicator',
  true,
  now(),
  now()
FROM auth.users
WHERE email = 'admin@equitymd.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true;