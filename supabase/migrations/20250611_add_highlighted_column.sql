-- Add highlighted column to deals table for priority featured deals
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS highlighted boolean DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_deals_highlighted ON deals(highlighted) WHERE highlighted = true;

-- Update existing deals that should be highlighted (none initially)
-- This will be done in the next migration when we insert the mock deals