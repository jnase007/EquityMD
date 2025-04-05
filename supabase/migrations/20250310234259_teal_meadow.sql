/*
  # Admin Setup Migration

  1. Changes
    - Add is_admin column to profiles table
    - Create admin user and profile
    - Add admin-specific RLS policies
    - Create site settings table
  
  2. Security
    - Enable RLS on site_settings table
    - Add admin-only policies
*/

-- Add is_admin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create admin user if not exists
DO $$
DECLARE
  admin_id uuid;
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
    ) RETURNING id INTO admin_id;

    -- Create admin profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      user_type,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      'admin@equitymd.com',
      'Admin',
      'syndicator',
      true,
      now(),
      now()
    );
  END IF;
END $$;

-- Create site settings table if not exists
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_black text,
  logo_white text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Enable RLS on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin site settings access" ON site_settings;
DROP POLICY IF EXISTS "Public read access for site settings" ON site_settings;

-- Create new policies
CREATE POLICY "Admin site settings access"
ON site_settings
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid()
  AND is_admin = true
));

CREATE POLICY "Public read access for site settings"
ON site_settings
FOR SELECT
TO public
USING (true);

-- Insert initial site settings if not exists
INSERT INTO site_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_settings);