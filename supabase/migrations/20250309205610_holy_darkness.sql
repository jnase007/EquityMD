/*
  # Add deal media support
  
  1. New Tables
    - `deal_media`
      - `id` (uuid, primary key)
      - `deal_id` (uuid, foreign key)
      - `type` (text) - 'image' or 'video'
      - `url` (text)
      - `title` (text)
      - `description` (text)
      - `order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `deal_media` table
    - Add policies for syndicators to manage their deal media
    - Add policy for public to view media of active deals
*/

CREATE TABLE IF NOT EXISTS deal_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  url text NOT NULL,
  title text,
  description text,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deal_media ENABLE ROW LEVEL SECURITY;

-- Allow syndicators to manage their deal media
CREATE POLICY "Syndicators can manage their deal media"
  ON deal_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_media.deal_id
      AND deals.syndicator_id = auth.uid()
    )
  );

-- Allow public to view media of active deals
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

-- Create index for better performance
CREATE INDEX idx_deal_media_deal_id ON deal_media(deal_id);