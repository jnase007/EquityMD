-- Fix overly restrictive review policy
-- Allow investors to review syndicators without requiring deal interest

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can create reviews" ON syndicator_reviews;

-- Create a more permissive policy for creating reviews
CREATE POLICY "Investors can create reviews"
  ON syndicator_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'investor'
    )
  );

-- Also update the update policy to be more explicit
DROP POLICY IF EXISTS "Users can update own reviews" ON syndicator_reviews;

CREATE POLICY "Investors can update own reviews"
  ON syndicator_reviews
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'investor'
    )
  )
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'investor'
    )
  ); 