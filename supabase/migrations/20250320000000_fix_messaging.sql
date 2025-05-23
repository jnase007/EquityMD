-- Fix messaging system by restoring direct messaging capability
-- Remove the connection requirement that was blocking messages

-- Drop the restrictive messaging policy
DROP POLICY IF EXISTS "Users can send messages with connection check" ON messages;

-- Restore the original simple messaging policy
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Ensure users can still read their own messages
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to update their own messages (for marking as read)
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id); 