-- Add missing columns to deals table for property listing wizard
-- These columns are used for investment metrics

-- Add preferred_return column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'preferred_return') THEN
        ALTER TABLE deals ADD COLUMN preferred_return DECIMAL(5,2);
    END IF;
END $$;

-- Add equity_multiple column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'equity_multiple') THEN
        ALTER TABLE deals ADD COLUMN equity_multiple DECIMAL(4,2);
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN deals.preferred_return IS 'Preferred return percentage (e.g., 8.0 for 8%)';
COMMENT ON COLUMN deals.equity_multiple IS 'Target equity multiple (e.g., 2.0 for 2x)';

