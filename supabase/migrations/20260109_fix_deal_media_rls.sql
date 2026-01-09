-- Fix deal_media RLS policies
-- The original policy incorrectly compared syndicator_id (a syndicators table FK) with auth.uid()
-- It should join with syndicators table and check claimed_by = auth.uid()

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Syndicators can manage their deal media" ON deal_media;

-- Create the correct policy for syndicators to manage their deal media
CREATE POLICY "Syndicators can manage their deal media"
  ON deal_media
  FOR ALL
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

-- Also ensure the public view policy exists and is correct
DROP POLICY IF EXISTS "Public can view media of active deals" ON deal_media;

CREATE POLICY "Public can view media of active deals"
  ON deal_media
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_media.deal_id
      AND deals.status = 'active'
    )
  );

-- =====================================================
-- FIX STORAGE BUCKET: Make deal-media bucket public
-- =====================================================

-- Update the bucket to be public so getPublicUrl works
UPDATE storage.buckets SET public = true WHERE id = 'deal-media';

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Authenticated users can view deal media" ON storage.objects;

-- Add public SELECT policy for deal-media bucket
CREATE POLICY "Public can view deal media"
ON storage.objects FOR SELECT
USING (bucket_id = 'deal-media');
