-- Investor Accreditation: Track investor verification status
CREATE TABLE IF NOT EXISTS investor_accreditation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'not_started',
  method TEXT, -- income, net_worth, professional, entity
  verification_date TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,
  documents TEXT[] DEFAULT '{}',
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE investor_accreditation ENABLE ROW LEVEL SECURITY;

-- Users can see their own accreditation
CREATE POLICY "accreditation_select_own" ON investor_accreditation
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own accreditation
CREATE POLICY "accreditation_insert_own" ON investor_accreditation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own accreditation
CREATE POLICY "accreditation_update_own" ON investor_accreditation
  FOR UPDATE USING (auth.uid() = user_id);

-- Syndicators can view accreditation status of investors who have expressed interest in their deals
CREATE POLICY "accreditation_select_syndicator" ON investor_accreditation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_interests di
      JOIN deals d ON di.deal_id = d.id
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE di.user_id = investor_accreditation.user_id
      AND s.claimed_by = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_investor_accreditation_user_id ON investor_accreditation(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_accreditation_status ON investor_accreditation(status);

