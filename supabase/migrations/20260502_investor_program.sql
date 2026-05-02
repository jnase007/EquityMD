-- Investor Program: Add subscription columns to syndicators table
-- Run this in Supabase SQL Editor manually

ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'cancelled'));
ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS subscribed_at timestamptz;
ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS subscription_cancelled_at timestamptz;

-- Create a view for investor feed access
-- Syndicators with active subscriptions can see investor_profiles created after their subscription date
CREATE OR REPLACE VIEW investor_feed_access AS
SELECT 
  s.id AS syndicator_id,
  s.company_name,
  s.subscription_status,
  s.subscribed_at,
  ip.id AS investor_profile_id,
  ip.accredited_status,
  ip.location,
  ip.preferred_property_types,
  ip.preferred_locations,
  ip.risk_tolerance,
  ip.investment_goals,
  ip.created_at AS investor_joined_at,
  p.full_name AS investor_name,
  p.email AS investor_email,
  p.avatar_url AS investor_avatar
FROM syndicators s
CROSS JOIN investor_profiles ip
JOIN profiles p ON p.id = ip.id
WHERE s.subscription_status = 'active'
  AND ip.created_at >= s.subscribed_at;
