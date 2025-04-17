-- Create notifications table
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

-- Enable Row Level Security (RLS) for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy allowing users to read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger function to create a notification when a message is sent
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

-- Trigger to execute function after a message is sent
CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();
;
