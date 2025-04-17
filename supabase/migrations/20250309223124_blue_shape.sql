-- Create syndicator reviews table
CREATE TABLE IF NOT EXISTS syndicator_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicator_id uuid REFERENCES syndicator_profiles(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(syndicator_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE syndicator_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON syndicator_reviews
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
  ON syndicator_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM deal_interests
      WHERE deal_interests.investor_id = auth.uid()
      AND deal_interests.deal_id IN (
        SELECT id FROM deals WHERE syndicator_id = syndicator_reviews.syndicator_id
      )
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON syndicator_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_syndicator_reviews_syndicator_id ON syndicator_reviews(syndicator_id);
CREATE INDEX IF NOT EXISTS idx_syndicator_reviews_reviewer_id ON syndicator_reviews(reviewer_id);

-- Add trigger for updating updated_at
CREATE TRIGGER update_syndicator_reviews_updated_at
  BEFORE UPDATE ON syndicator_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
;
