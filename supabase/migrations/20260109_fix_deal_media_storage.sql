-- =====================================================
-- COMPREHENSIVE FIX FOR DEAL MEDIA STORAGE
-- Run this in Supabase SQL Editor to fix image uploads
-- =====================================================

-- 1. Create or update deal-media bucket (ensure it exists and is public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deal-media',
  'deal-media',
  true,  -- MUST be public for getPublicUrl to work
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Drop ALL existing storage policies for deal-media to start fresh
DROP POLICY IF EXISTS "Authenticated users can view deal media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view deal media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload deal media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own deal media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own deal media" ON storage.objects;
DROP POLICY IF EXISTS "Deal media public access" ON storage.objects;
DROP POLICY IF EXISTS "Deal media upload" ON storage.objects;
DROP POLICY IF EXISTS "Deal media delete" ON storage.objects;

-- 3. Create clean storage policies for deal-media bucket

-- Anyone can VIEW deal media (it's a public bucket)
CREATE POLICY "deal-media: public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'deal-media');

-- Authenticated users can UPLOAD to deal-media
CREATE POLICY "deal-media: authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deal-media');

-- Authenticated users can UPDATE their uploads
CREATE POLICY "deal-media: authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'deal-media')
WITH CHECK (bucket_id = 'deal-media');

-- Authenticated users can DELETE from deal-media
CREATE POLICY "deal-media: authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'deal-media');

-- =====================================================
-- 4. Fix deal_media TABLE RLS policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Syndicators can manage their deal media" ON deal_media;
DROP POLICY IF EXISTS "Public can view media of active deals" ON deal_media;
DROP POLICY IF EXISTS "Anyone can view deal media" ON deal_media;
DROP POLICY IF EXISTS "Syndicators can insert deal media" ON deal_media;
DROP POLICY IF EXISTS "Syndicators can update deal media" ON deal_media;
DROP POLICY IF EXISTS "Syndicators can delete deal media" ON deal_media;

-- Enable RLS if not already enabled
ALTER TABLE deal_media ENABLE ROW LEVEL SECURITY;

-- Public can view all deal media (for active deals)
CREATE POLICY "deal_media: public read for active deals"
ON deal_media FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM deals
    WHERE deals.id = deal_media.deal_id
    AND deals.status = 'active'
  )
);

-- Syndicators can view ALL their deal media (including drafts)
CREATE POLICY "deal_media: syndicators read own"
ON deal_media FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_media.deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- Syndicators can INSERT deal media for their deals
CREATE POLICY "deal_media: syndicators insert"
ON deal_media FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- Syndicators can UPDATE their deal media
CREATE POLICY "deal_media: syndicators update"
ON deal_media FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_media.deal_id
    AND s.claimed_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_media.deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- Syndicators can DELETE their deal media
CREATE POLICY "deal_media: syndicators delete"
ON deal_media FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM deals d
    JOIN syndicators s ON d.syndicator_id = s.id
    WHERE d.id = deal_media.deal_id
    AND s.claimed_by = auth.uid()
  )
);

-- =====================================================
-- 5. Verify the setup
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Deal media storage fix complete!';
  RAISE NOTICE 'Bucket deal-media is now public with proper upload policies.';
  RAISE NOTICE 'deal_media table has proper RLS policies for syndicators.';
END $$;
