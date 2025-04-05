/*
  # Site Settings and Logo Management

  1. New Tables
    - `site_settings` table for managing global site configuration
      - `id` (uuid, primary key)
      - `logo_black` (text, nullable) - URL for black logo variant
      - `logo_white` (text, nullable) - URL for white logo variant
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references profiles)

  2. Security
    - Enable RLS on site_settings table
    - Add policy for admin-only updates
    - Add policy for public read access

  3. Initial Data
    - Insert default settings record
*/

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS site_settings CASCADE;

-- Create site_settings table
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_black text,
  logo_white text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Admin-only updates
CREATE POLICY "Admin only updates for site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert initial settings
INSERT INTO site_settings (logo_black, logo_white)
VALUES ('/logo-black.png', '/logo-white.png');

-- Add updated_at trigger
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();