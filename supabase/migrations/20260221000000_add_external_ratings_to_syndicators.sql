-- Add external ratings columns to syndicators table for SEO/AEO enhancement
-- Part 1: External Ratings on Syndicator Profiles

ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS bbb_rating text;
ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS bbb_accredited boolean DEFAULT false;
ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS trustpilot_rating numeric;
ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS trustpilot_review_count integer;
ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS google_rating numeric;
ALTER TABLE syndicators ADD COLUMN IF NOT EXISTS google_review_count integer;
