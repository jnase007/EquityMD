-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Create function to handle email notifications
CREATE OR REPLACE FUNCTION handle_email_notification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  receiver_email text;
  receiver_preferences jsonb;
  sender_name text;
BEGIN
  -- Get receiver's email and notification preferences
  SELECT p.email, p.email_notifications, s.full_name
  INTO receiver_email, receiver_preferences, sender_name
  FROM profiles p
  LEFT JOIN profiles s ON s.id = NEW.sender_id
  WHERE p.id = NEW.receiver_id;

  -- Check if user wants message notifications
  IF receiver_preferences->>'messages' = 'true' THEN
    -- Call edge function to send email
    PERFORM
      net.http_post(
        url := CONCAT(current_setting('app.settings.edge_function_url'), '/send-email'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', current_setting('app.settings.edge_function_key')
        ),
        body := jsonb_build_object(
          'to', receiver_email,
          'subject', 'New Message from ' || sender_name,
          'content', 'You have received a new message. Click below to view it.',
          'type', 'message'
        )
      );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for email notifications
DROP TRIGGER IF EXISTS on_new_message_email ON messages;
CREATE TRIGGER on_new_message_email
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_notification();
