-- Deal expiration reminder preferences
-- Stores user preferences for deal closing reminders

CREATE TABLE IF NOT EXISTS deal_reminder_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  remind_days_before INTEGER[] DEFAULT '{7, 3, 1}', -- Remind 7, 3, and 1 day before
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Track sent reminders to avoid duplicates
CREATE TABLE IF NOT EXISTS deal_reminders_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'closing_soon', 'closing_tomorrow', 'closing_today'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deal_id, reminder_type)
);

-- RLS policies
ALTER TABLE deal_reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_reminders_sent ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can view own preferences" ON deal_reminder_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON deal_reminder_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON deal_reminder_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reminders sent - read only for users
CREATE POLICY "Users can view own reminders" ON deal_reminders_sent
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert reminders (via service role)
CREATE POLICY "System can insert reminders" ON deal_reminders_sent
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminder_prefs_user ON deal_reminder_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_user ON deal_reminders_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_deal ON deal_reminders_sent(deal_id);

-- View for deals closing soon (for admin/cron job)
CREATE OR REPLACE VIEW deals_closing_soon AS
SELECT 
  d.id,
  d.title,
  d.slug,
  d.closing_date,
  d.syndicator_id,
  DATE_PART('day', d.closing_date - CURRENT_DATE) as days_until_close
FROM deals d
WHERE d.status = 'active'
  AND d.closing_date IS NOT NULL
  AND d.closing_date >= CURRENT_DATE
  AND d.closing_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY d.closing_date ASC;

