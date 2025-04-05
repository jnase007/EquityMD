/*
  # Add RLS policy for notifications

  1. Security
    - Enable RLS on notifications table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications
    - Add policy for system to create notifications
*/

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop read policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can read own notifications'
  ) THEN
    DROP POLICY "Users can read own notifications" ON notifications;
  END IF;

  -- Drop update policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can update own notifications'
  ) THEN
    DROP POLICY "Users can update own notifications" ON notifications;
  END IF;

  -- Drop insert policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'System can create notifications'
  ) THEN
    DROP POLICY "System can create notifications" ON notifications;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);