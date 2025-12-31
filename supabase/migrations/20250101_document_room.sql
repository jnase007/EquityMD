-- Document Room: Store deal documents
CREATE TABLE IF NOT EXISTS deal_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  requires_nda BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NDA Signatures: Track who has signed NDAs for which deals
CREATE TABLE IF NOT EXISTS deal_nda_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  UNIQUE(deal_id, user_id)
);

-- Deal Activities: Track user actions on deals
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for deal_documents
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;

-- Anyone can read documents (access controlled in app layer via NDA)
CREATE POLICY "deal_documents_select" ON deal_documents
  FOR SELECT USING (true);

-- Only syndicator owners can insert/update/delete
CREATE POLICY "deal_documents_insert" ON deal_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

CREATE POLICY "deal_documents_update" ON deal_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

CREATE POLICY "deal_documents_delete" ON deal_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

-- RLS Policies for deal_nda_signatures
ALTER TABLE deal_nda_signatures ENABLE ROW LEVEL SECURITY;

-- Users can see their own signatures
CREATE POLICY "nda_signatures_select_own" ON deal_nda_signatures
  FOR SELECT USING (auth.uid() = user_id);

-- Syndicator owners can see all signatures for their deals
CREATE POLICY "nda_signatures_select_owner" ON deal_nda_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

-- Users can insert their own signatures
CREATE POLICY "nda_signatures_insert" ON deal_nda_signatures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for deal_activities
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

-- Users can see their own activities
CREATE POLICY "activities_select_own" ON deal_activities
  FOR SELECT USING (auth.uid() = user_id);

-- Syndicator owners can see all activities for their deals
CREATE POLICY "activities_select_owner" ON deal_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

-- Any authenticated user can insert activities
CREATE POLICY "activities_insert" ON deal_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_nda_signatures_deal_id ON deal_nda_signatures(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_nda_signatures_user_id ON deal_nda_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_user_id ON deal_activities(user_id);

