/*
  # Fix Email Notifications System

  1. Changes
    - Remove dependency on net schema
    - Create notification function using pg_notify for async processing
    - Add trigger for message notifications

  2. Security
    - Maintain existing RLS policies
    - Add function security definer for notifications
*/

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
    -- Create notification record
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      data
    ) VALUES (
      NEW.receiver_id,
      'message',
      'New Message from ' || sender_name,
      NEW.content,
      jsonb_build_object(
        'sender_id', NEW.sender_id,
        'deal_id', NEW.deal_id
      )
    );

    -- Notify through PostgreSQL notification system
    PERFORM pg_notify(
      'email_notifications',
      json_build_object(
        'email', receiver_email,
        'subject', 'New Message from ' || sender_name,
        'content', 'You have received a new message: ' || NEW.content
      )::text
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create notification trigger
DROP TRIGGER IF EXISTS on_message_sent ON messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_notification();

-- Create function to create message notification
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    data
  ) VALUES (
    NEW.receiver_id,
    'message',
    CASE 
      WHEN NEW.deal_id IS NOT NULL THEN
        (SELECT 'New message about ' || title FROM deals WHERE id = NEW.deal_id)
      ELSE
        'New message'
    END,
    NEW.content,
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'deal_id', NEW.deal_id,
      'deal_slug', CASE 
        WHEN NEW.deal_id IS NOT NULL THEN
          (SELECT regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g') FROM deals WHERE id = NEW.deal_id)
        ELSE
          NULL
      END
    )
  );
  RETURN NEW;
END;
$$;

-- Create notification trigger
DROP TRIGGER IF EXISTS on_new_message_email ON messages;
CREATE TRIGGER on_new_message_email
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();