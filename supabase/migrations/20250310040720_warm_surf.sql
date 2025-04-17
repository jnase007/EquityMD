-- Create message notification trigger function
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for message recipient
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    data,
    read
  )
  SELECT
    NEW.receiver_id,
    'message',
    CASE 
      WHEN d.id IS NOT NULL THEN 
        'New message about ' || d.title
      ELSE 
        'New message'
    END,
    SUBSTRING(NEW.content, 1, 200),
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'deal_id', NEW.deal_id,
      'deal_slug', CASE 
        WHEN d.id IS NOT NULL THEN 
          LOWER(REGEXP_REPLACE(d.title, '[^a-zA-Z0-9]+', '-', 'g'))
        ELSE 
          NULL
      END
    ),
    false
  FROM profiles p
  LEFT JOIN deals d ON d.id = NEW.deal_id
  WHERE p.id = NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add sample notifications
INSERT INTO messages (id, sender_id, receiver_id, deal_id, content, created_at)
SELECT 
  gen_random_uuid(),
  s.id as sender_id,
  i.id as receiver_id,
  d.id as deal_id,
  'Thank you for your interest in ' || d.title || '. I''d be happy to schedule a call to discuss the opportunity in detail.',
  NOW() - INTERVAL '2 days'
FROM 
  profiles i
  CROSS JOIN LATERAL (
    SELECT id, syndicator_id, title 
    FROM deals 
    WHERE status = 'active' 
    LIMIT 1
  ) d
  JOIN profiles s ON s.id = d.syndicator_id
WHERE 
  i.user_type = 'investor'
LIMIT 1;

INSERT INTO messages (id, sender_id, receiver_id, deal_id, content, created_at)
SELECT 
  gen_random_uuid(),
  s.id as sender_id,
  i.id as receiver_id,
  d.id as deal_id,
  'We''ve received your investment commitment. Our team will reach out shortly with the next steps and documentation.',
  NOW() - INTERVAL '1 day'
FROM 
  profiles i
  CROSS JOIN LATERAL (
    SELECT id, syndicator_id, title 
    FROM deals 
    WHERE status = 'active' 
    LIMIT 1
  ) d
  JOIN profiles s ON s.id = d.syndicator_id
WHERE 
  i.user_type = 'investor'
LIMIT 1;

INSERT INTO messages (id, sender_id, receiver_id, deal_id, content, created_at)
SELECT 
  gen_random_uuid(),
  s.id as sender_id,
  i.id as receiver_id,
  d.id as deal_id,
  'Important update: We''ve secured additional parking spaces for the property, increasing the potential NOI. Would you like to review the updated pro forma?',
  NOW() - INTERVAL '12 hours'
FROM 
  profiles i
  CROSS JOIN LATERAL (
    SELECT id, syndicator_id, title 
    FROM deals 
    WHERE status = 'active' 
    LIMIT 1
  ) d
  JOIN profiles s ON s.id = d.syndicator_id
WHERE 
  i.user_type = 'investor'
LIMIT 1;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_message_sent ON messages;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();
