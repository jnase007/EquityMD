-- New features database migration
-- Created: 2025-02-01

-- =====================================================
-- 1. INVESTMENT GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS investment_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL DEFAULT 100000,
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  target_date DATE,
  property_types TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for investment_goals
ALTER TABLE investment_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON investment_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" ON investment_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON investment_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON investment_goals
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. DUE DILIGENCE CHECKLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS due_diligence_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_items TEXT[] DEFAULT '{}',
  notes JSONB DEFAULT '{}',
  red_flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, user_id)
);

-- RLS for due_diligence_checklists
ALTER TABLE due_diligence_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists" ON due_diligence_checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checklists" ON due_diligence_checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists" ON due_diligence_checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists" ON due_diligence_checklists
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. WEBINARS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  syndicator_id UUID REFERENCES syndicators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  recording_url TEXT,
  max_attendees INTEGER DEFAULT 100,
  attendee_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for webinars
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view webinars" ON webinars
  FOR SELECT USING (true);

CREATE POLICY "Syndicators can create webinars" ON webinars
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM syndicators 
      WHERE id = syndicator_id AND claimed_by = auth.uid()
    )
  );

CREATE POLICY "Syndicators can update own webinars" ON webinars
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM syndicators 
      WHERE id = syndicator_id AND claimed_by = auth.uid()
    )
  );

CREATE POLICY "Syndicators can delete own webinars" ON webinars
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM syndicators 
      WHERE id = syndicator_id AND claimed_by = auth.uid()
    )
  );

-- =====================================================
-- 4. WEBINAR RSVPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webinar_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show')),
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(webinar_id, user_id)
);

-- RLS for webinar_rsvps
ALTER TABLE webinar_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RSVPs" ON webinar_rsvps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own RSVPs" ON webinar_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVPs" ON webinar_rsvps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVPs" ON webinar_rsvps
  FOR DELETE USING (auth.uid() = user_id);

-- Syndicators can view all RSVPs for their webinars
CREATE POLICY "Syndicators can view webinar RSVPs" ON webinar_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webinars w
      JOIN syndicators s ON w.syndicator_id = s.id
      WHERE w.id = webinar_id AND s.claimed_by = auth.uid()
    )
  );

-- =====================================================
-- 5. SYNDICATOR VERIFICATION FIELDS
-- =====================================================
ALTER TABLE syndicators 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS background_checked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS successful_exits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_raised DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_tier TEXT DEFAULT 'unverified' 
  CHECK (verification_tier IN ('unverified', 'bronze', 'silver', 'gold', 'diamond'));

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_investment_goals_user ON investment_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_checklists_user ON due_diligence_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_checklists_deal ON due_diligence_checklists(deal_id);
CREATE INDEX IF NOT EXISTS idx_webinars_syndicator ON webinars(syndicator_id);
CREATE INDEX IF NOT EXISTS idx_webinars_deal ON webinars(deal_id);
CREATE INDEX IF NOT EXISTS idx_webinars_date ON webinars(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_webinar_rsvps_webinar ON webinar_rsvps(webinar_id);
CREATE INDEX IF NOT EXISTS idx_webinar_rsvps_user ON webinar_rsvps(user_id);

-- =====================================================
-- 7. UPDATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investment_goals_updated_at
  BEFORE UPDATE ON investment_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_due_diligence_checklists_updated_at
  BEFORE UPDATE ON due_diligence_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON webinars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

