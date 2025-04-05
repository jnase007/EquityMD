/*
  # Add site settings table and policies

  1. New Tables
    - site_settings
      - id (uuid, primary key)
      - logo_black (text, nullable)
      - logo_white (text, nullable)
      - updated_at (timestamptz)
      - updated_by (uuid, references profiles)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
  DROP POLICY IF EXISTS "Only admins can update site settings" ON site_settings;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create site settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_black text,
  logo_white text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Add policies for admin access
CREATE POLICY "Public can view site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can update site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  ));

-- Insert initial row if none exists
INSERT INTO site_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_settings);