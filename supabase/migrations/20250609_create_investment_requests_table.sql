-- Create investment_requests table to track investment request amounts
-- This replaces capital raised metrics for confidentiality

CREATE TABLE investment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_investment_requests_deal
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    CONSTRAINT fk_investment_requests_user
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_investment_requests_deal_id ON investment_requests(deal_id);
CREATE INDEX idx_investment_requests_user_id ON investment_requests(user_id);
CREATE INDEX idx_investment_requests_status ON investment_requests(status);
CREATE INDEX idx_investment_requests_created_at ON investment_requests(created_at);

-- Create a composite index for common queries
CREATE INDEX idx_investment_requests_deal_status ON investment_requests(deal_id, status);

-- Enable Row Level Security
ALTER TABLE investment_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own investment requests
CREATE POLICY "Users can view their own investment requests"
    ON investment_requests FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own investment requests
CREATE POLICY "Users can insert their own investment requests"
    ON investment_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own investment requests
CREATE POLICY "Users can update their own investment requests"
    ON investment_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Syndicators can view investment requests for their deals
CREATE POLICY "Syndicators can view investment requests for their deals"
    ON investment_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = investment_requests.deal_id 
            AND deals.syndicator_id = auth.uid()
        )
    );

-- RLS Policy: Admins can view all investment requests
CREATE POLICY "Admins can view all investment requests"
    ON investment_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_investment_requests_updated_at
    BEFORE UPDATE ON investment_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_investment_requests_updated_at();

-- Add comment for documentation
COMMENT ON TABLE investment_requests IS 'Tracks investment request amounts for deals to replace capital raised metrics for confidentiality';
COMMENT ON COLUMN investment_requests.amount IS 'Investment amount requested in cents (e.g., 100000 = $1,000)';
COMMENT ON COLUMN investment_requests.status IS 'Status of the investment request: pending, approved, rejected, withdrawn'; 