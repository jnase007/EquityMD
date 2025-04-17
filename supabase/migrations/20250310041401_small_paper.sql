-- Add email notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications jsonb DEFAULT jsonb_build_object(
  'messages', true,
  'deal_updates', true,
  'investment_status', true
);

-- Create function to handle email notifications
CREATE OR REPLACE FUNCTION handle_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_email TEXT;
  receiver_prefs JSONB;
  sender_name TEXT;
  notification_type TEXT;
BEGIN
  -- Get receiver's email and preferences
  SELECT email, email_notifications, full_name
  INTO receiver_email, receiver_prefs, sender_name
  FROM profiles
  WHERE id = NEW.receiver_id;

  -- Determine notification type
  IF TG_TABLE_NAME = 'messages' THEN
    notification_type := 'messages';
  ELSE
    notification_type := 'other';
  END IF;

  -- Check if user wants email notifications for this type
  IF receiver_prefs->notification_type = 'true' THEN
    -- Send email via Supabase Edge Function
    PERFORM
      net.http_post(
        url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/send-email'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
        ),
        body := jsonb_build_object(
          'to', receiver_email,
          'subject', CASE
            WHEN notification_type = 'messages' THEN 'New Message from ' || sender_name
            ELSE 'New Notification'
          END,
          'content', CASE
            WHEN notification_type = 'messages' THEN NEW.content
            ELSE 'You have a new notification'
          END,
          'type', notification_type
        )
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message_email ON messages;
CREATE TRIGGER on_new_message_email
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_notification();
