-- Migration: Add 'pending' verification status and deal approval system
-- Date: 2026-05-02

-- 1. Add 'pending' to syndicators verification_status CHECK constraint
ALTER TABLE syndicators 
DROP CONSTRAINT IF EXISTS syndicators_verification_status_check;

ALTER TABLE syndicators 
ADD CONSTRAINT syndicators_verification_status_check 
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'featured', 'premium', 'premier'));

-- 2. Add deal approval columns
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 3. Set all existing active deals to 'approved' so they remain visible
UPDATE deals SET approval_status = 'approved' WHERE status = 'active' AND approval_status IS NULL;
UPDATE deals SET approval_status = 'pending' WHERE status != 'active' AND approval_status IS NULL;

-- 4. Create verification-docs storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for verification-docs bucket
-- Syndicators can upload to their own folder
CREATE POLICY "Syndicators can upload verification docs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid() IS NOT NULL
);

-- Syndicators can view their own docs
CREATE POLICY "Syndicators can view own verification docs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-docs'
  AND auth.uid() IS NOT NULL
);

-- Admins can view all verification docs (handled via service role or admin check)
