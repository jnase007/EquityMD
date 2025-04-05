/*
  # Add Gated Access Control to Site Settings
  
  1. Changes
    - Add require_auth column to site_settings table
    - Set default value to false
    - Update existing records
*/

-- Add require_auth column to site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS require_auth boolean DEFAULT false;

-- Update existing records
UPDATE site_settings
SET require_auth = false
WHERE require_auth IS NULL;