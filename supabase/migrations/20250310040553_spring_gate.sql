DO $$ 
BEGIN
  -- Update existing message notifications to include deal_slug
  UPDATE notifications n
  SET data = jsonb_set(
    COALESCE(n.data, '{}'::jsonb),
    '{deal_slug}',
    to_jsonb(LOWER(REGEXP_REPLACE(d.title, '[^a-zA-Z0-9]+', '-', 'g')))
  )
  FROM messages m
  JOIN deals d ON m.deal_id = d.id
  WHERE n.type = 'message' 
  AND n.data->>'message_id' = m.id::text;
  
END $$;
;
