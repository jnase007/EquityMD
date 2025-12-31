-- Investor Updates: Syndicator-to-investor communications
CREATE TABLE IF NOT EXISTS investor_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT NOT NULL DEFAULT 'general', -- general, distribution, milestone, financial
  distribution_amount DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE investor_updates ENABLE ROW LEVEL SECURITY;

-- Anyone can read updates for deals they have interest in or have invested
CREATE POLICY "updates_select_interested" ON investor_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_interests di
      WHERE di.deal_id = investor_updates.deal_id AND di.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM investments i
      WHERE i.deal_id = investor_updates.deal_id AND i.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = investor_updates.deal_id AND s.claimed_by = auth.uid()
    )
  );

-- Only syndicator owners can insert updates
CREATE POLICY "updates_insert_syndicator" ON investor_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

-- Only syndicator owners can delete updates
CREATE POLICY "updates_delete_syndicator" ON investor_updates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_investor_updates_deal_id ON investor_updates(deal_id);
CREATE INDEX IF NOT EXISTS idx_investor_updates_created_at ON investor_updates(created_at DESC);

