-- Create favorites table for investors to save deals they're interested in
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure a user can only favorite a deal once
    UNIQUE(investor_id, deal_id)
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS favorites_investor_id_idx ON favorites(investor_id);
CREATE INDEX IF NOT EXISTS favorites_deal_id_idx ON favorites(deal_id);
CREATE INDEX IF NOT EXISTS favorites_created_at_idx ON favorites(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (investor_id = auth.uid());

-- Users can only create their own favorites
CREATE POLICY "Users can create their own favorites" ON favorites
    FOR INSERT WITH CHECK (investor_id = auth.uid());

-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (investor_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 