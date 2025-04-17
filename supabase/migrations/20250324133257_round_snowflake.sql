-- Add require_auth column to site_settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS require_auth boolean DEFAULT false;

-- Update existing records to set require_auth to false where it is NULL
UPDATE site_settings
  SET require_auth = false
  WHERE require_auth IS NULL;
