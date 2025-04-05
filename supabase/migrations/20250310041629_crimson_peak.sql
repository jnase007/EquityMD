/*
  # Add email notifications support

  1. Changes
    - Add email_notifications column to profiles table with default notification preferences
    - Add trigger function to handle email notifications
    - Add trigger for sending email notifications

  2. Security
    - No changes to RLS policies needed
*/

-- Add email_notifications column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications jsonb DEFAULT jsonb_build_object(
  'messages', true,
  'deal_updates', true,
  'investment_status', true
);

-- Create function to handle email notifications
CREATE OR REPLACE FUNCTION handle_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_email text;
  receiver_preferences jsonb;
  notification_type text;
  email_subject text;
  email_content text;
BEGIN
  -- Get receiver's email and preferences
  SELECT email, email_notifications 
  INTO receiver_email, receiver_preferences
  FROM profiles
  JOIN auth.users ON profiles.id = users.id
  WHERE profiles.id = NEW.user_id;

  -- Determine notification type and check preferences
  CASE NEW.type
    WHEN 'message' THEN
      IF NOT (receiver_preferences->>'messages')::boolean THEN
        RETURN NEW;
      END IF;
      notification_type := 'messages';
      email_subject := NEW.title;
      email_content := NEW.content;
    WHEN 'deal_update' THEN
      IF NOT (receiver_preferences->>'deal_updates')::boolean THEN
        RETURN NEW;
      END IF;
      notification_type := 'deal_updates';
      email_subject := NEW.title;
      email_content := NEW.content;
    WHEN 'investment_status' THEN
      IF NOT (receiver_preferences->>'investment_status')::boolean THEN
        RETURN NEW;
      END IF;
      notification_type := 'investment_status';
      email_subject := NEW.title;
      email_content := NEW.content;
    ELSE
      RETURN NEW;
  END CASE;

  -- Call edge function to send email
  PERFORM net.http_post(
    url := CONCAT(current_setting('supabase_functions_endpoint'), '/send-email'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', current_setting('supabase_auth.jwt_secret'))
    ),
    body := jsonb_build_object(
      'to', receiver_email,
      'subject', email_subject,
      'content', email_content,
      'type', notification_type
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;