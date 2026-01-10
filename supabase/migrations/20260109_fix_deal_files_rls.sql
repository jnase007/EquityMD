-- =====================================================
-- FIX DEAL FILES TABLE RLS POLICIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create deal_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS deal_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  description TEXT,
  category TEXT DEFAULT 'Other Documents',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deal_files_deal_id ON deal_files(deal_id);

-- Enable RLS
ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view public deal files" ON deal_files;
DROP POLICY IF EXISTS "Authenticated can view private deal files" ON deal_files;
DROP POLICY IF EXISTS "Syndicators can manage their deal files" ON deal_files;
DROP POLICY IF EXISTS "deal_files: public read" ON deal_files;
DROP POLICY IF EXISTS "deal_files: authenticated read private" ON deal_files;
DROP POLICY IF EXISTS "deal_files: syndicators insert" ON deal_files;
DROP POLICY IF EXISTS "deal_files: syndicators update" ON deal_files;
DROP POLICY IF EXISTS "deal_files: syndicators delete" ON deal_files;

-- Public can view PUBLIC files on ACTIVE deals
CREATE POLICY "deal_files: public read public files"
ON deal_files FOR SELECT
TO public
USING (
  is_private = false
  AND EXISTS (
    SELECT 1 FROM deals
    WHERE deals.id = deal_files.deal_id
    AND deals.status = 'active'
  )
);

-- Authenticated users can view PRIVATE files on active deals
CREATE POLICY "deal_files: authenticated read private files"
ON deal_files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals
    WHERE deals.id = deal_files.deal_id
    AND deals.status = 'active'
  )
);

-- Syndicators can view ALL their deal files (including drafts)
CREATE POLICY "deal_files: syndicators read own"
ON deal_files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_files.deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- Syndicators can INSERT files for their deals
CREATE POLICY "deal_files: syndicators insert"
ON deal_files FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- Syndicators can UPDATE their deal files
CREATE POLICY "deal_files: syndicators update"
ON deal_files FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_files.deal_id
    AND s.claimed_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_files.deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- Syndicators can DELETE their deal files
CREATE POLICY "deal_files: syndicators delete"
ON deal_files FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_files.deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'deal_files table and RLS policies created successfully!';
END $$;
