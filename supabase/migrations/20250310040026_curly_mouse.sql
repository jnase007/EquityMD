/*
  # Add notifications system
  
  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - e.g. 'message', 'deal_update', etc.
      - `title` (text)
      - `content` (text)
      - `read` (boolean)
      - `data` (jsonb) - Additional data specific to notification type
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on notifications table
    - Add policy for users to read their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to create notification when message is sent
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    data
  )
  VALUES (
    NEW.receiver_id,
    'message',
    'New Message',
    NEW.content,
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'deal_id', NEW.deal_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();