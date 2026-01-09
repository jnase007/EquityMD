-- Add missing columns to deals table that are expected by PropertyListingWizard

-- Add closing_date column
ALTER TABLE deals ADD COLUMN IF NOT EXISTS closing_date TIMESTAMPTZ;

-- Add preferred_return column (percentage, e.g., 8.0 for 8%)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS preferred_return NUMERIC;

-- Add equity_multiple column (e.g., 2.0 for 2x)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS equity_multiple NUMERIC;

-- Add video_url column for property video tours
ALTER TABLE deals ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment
COMMENT ON COLUMN deals.closing_date IS 'Expected closing date for the investment opportunity';
COMMENT ON COLUMN deals.preferred_return IS 'Preferred return percentage for investors';
COMMENT ON COLUMN deals.equity_multiple IS 'Target equity multiple (e.g., 2.0 for 2x return)';
COMMENT ON COLUMN deals.video_url IS 'URL to video tour (YouTube, Vimeo, etc.)';

-- Create index on closing_date for efficient queries
CREATE INDEX IF NOT EXISTS idx_deals_closing_date ON deals(closing_date) WHERE closing_date IS NOT NULL;
