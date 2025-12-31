-- Add view tracking and closing date for deals

-- Add view_count column to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add closing_date column for investment deadline
ALTER TABLE deals ADD COLUMN IF NOT EXISTS closing_date TIMESTAMP WITH TIME ZONE;

-- Create table for tracking individual views (for analytics)
CREATE TABLE IF NOT EXISTS deal_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT, -- Hashed IP for anonymous view tracking
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deal_views_deal_id ON deal_views(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_views_viewed_at ON deal_views(viewed_at);

-- Enable RLS
ALTER TABLE deal_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views
CREATE POLICY "Anyone can record views" ON deal_views
  FOR INSERT WITH CHECK (true);

-- Only deal owners can see detailed view analytics
CREATE POLICY "Deal owners can view analytics" ON deal_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_views.deal_id
      AND s.claimed_by = auth.uid()
    )
  );

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_deal_view(deal_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE deals SET view_count = COALESCE(view_count, 0) + 1 WHERE id = deal_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

