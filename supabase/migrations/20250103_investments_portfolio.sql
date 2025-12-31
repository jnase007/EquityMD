-- Investments: Track actual investments made by users
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, funded, active, completed
  invested_at TIMESTAMPTZ DEFAULT NOW(),
  funded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment Distributions: Track distributions to investors
CREATE TABLE IF NOT EXISTS investment_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'quarterly', -- quarterly, annual, sale, refinance
  distributed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Searches: Store investor search preferences for deal alerts
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  email_alerts BOOLEAN DEFAULT true,
  alert_frequency TEXT DEFAULT 'daily', -- instant, daily, weekly
  last_alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal Comparisons: Track comparison lists
CREATE TABLE IF NOT EXISTS deal_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor Pipeline: Track syndicator's view of interested investors
CREATE TABLE IF NOT EXISTS investor_pipeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  syndicator_id UUID NOT NULL REFERENCES syndicators(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'interested', -- interested, contacted, qualified, negotiating, committed, funded
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(syndicator_id, deal_id, investor_id)
);

-- Referrals: Track user referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, rewarded
  reward_amount DECIMAL(10,2),
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- RLS Policies for investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investments_select_own" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "investments_select_syndicator" ON investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE d.id = deal_id AND s.claimed_by = auth.uid()
    )
  );

CREATE POLICY "investments_insert" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for investment_distributions
ALTER TABLE investment_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "distributions_select_own" ON investment_distributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM investments i
      WHERE i.id = investment_id AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "distributions_insert_syndicator" ON investment_distributions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM investments i
      JOIN deals d ON i.deal_id = d.id
      JOIN syndicators s ON d.syndicator_id = s.id
      WHERE i.id = investment_id AND s.claimed_by = auth.uid()
    )
  );

-- RLS Policies for saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_searches_own" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for deal_comparisons
ALTER TABLE deal_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deal_comparisons_own" ON deal_comparisons
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for investor_pipeline
ALTER TABLE investor_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipeline_select_syndicator" ON investor_pipeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM syndicators s
      WHERE s.id = syndicator_id AND s.claimed_by = auth.uid()
    )
  );

CREATE POLICY "pipeline_modify_syndicator" ON investor_pipeline
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM syndicators s
      WHERE s.id = syndicator_id AND s.claimed_by = auth.uid()
    )
  );

-- RLS Policies for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_own" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "referrals_insert" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_deal_id ON investments(deal_id);
CREATE INDEX IF NOT EXISTS idx_distributions_investment_id ON investment_distributions(investment_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_syndicator_id ON investor_pipeline(syndicator_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);

