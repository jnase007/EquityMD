/*
  # Add investor connection rules

  1. New Tables
    - `investor_connections`
      - `id` (uuid, primary key)
      - `investor_id` (uuid, references profiles)
      - `syndicator_id` (uuid, references profiles)
      - `initiated_by` (text, either 'investor' or 'syndicator')
      - `status` (text, either 'pending', 'accepted', 'rejected')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `investor_connections` table
    - Add policies for connection management
    - Update message policies to check connections

  3. Changes
    - Add connection check to messages policy
*/

-- Create investor connections table
CREATE TABLE IF NOT EXISTS investor_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  syndicator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  initiated_by text NOT NULL CHECK (initiated_by IN ('investor', 'syndicator')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(investor_id, syndicator_id)
);

-- Enable RLS
ALTER TABLE investor_connections ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_investor_connections_updated_at
  BEFORE UPDATE ON investor_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Policies for investor connections
CREATE POLICY "Investors can view their own connections"
  ON investor_connections
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = investor_id OR 
    auth.uid() = syndicator_id
  );

CREATE POLICY "Investors can initiate connections"
  ON investor_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Check that the user is an investor
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'investor'
    ) AND
    -- Ensure they're creating a connection as an investor
    auth.uid() = investor_id AND
    initiated_by = 'investor'
  );

-- Update messages policy to check for connection
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can send messages with connection check"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Sender must be the authenticated user
    auth.uid() = sender_id AND
    (
      -- If sender is investor, must have initiated connection
      (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND user_type = 'investor'
        ) AND
        EXISTS (
          SELECT 1 FROM investor_connections
          WHERE investor_id = auth.uid()
          AND syndicator_id = receiver_id
          AND initiated_by = 'investor'
        )
      ) OR
      -- If sender is syndicator, must have accepted connection
      (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND user_type = 'syndicator'
        ) AND
        EXISTS (
          SELECT 1 FROM investor_connections
          WHERE syndicator_id = auth.uid()
          AND investor_id = receiver_id
          AND status = 'accepted'
        )
      )
    )
  );

-- Index for performance
CREATE INDEX idx_investor_connections_participants 
  ON investor_connections(investor_id, syndicator_id);