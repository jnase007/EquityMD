-- Create function to handle new deal notifications
CREATE OR REPLACE FUNCTION handle_new_deal_notification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  investor_record RECORD;
  syndicator_name TEXT;
BEGIN
  -- Get syndicator name
  SELECT company_name INTO syndicator_name
  FROM syndicator_profiles
  WHERE id = NEW.syndicator_id;

  -- Only send notifications for active deals
  IF NEW.status = 'active' THEN
    -- Create notifications for all investors
    FOR investor_record IN
      SELECT p.id, p.email, p.email_notifications
      FROM profiles p
      JOIN investor_profiles ip ON ip.id = p.id
      WHERE p.user_type = 'investor'
    LOOP
      -- Create notification record
      INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        data
      ) VALUES (
        investor_record.id,
        'deal_update',
        'New Investment Opportunity',
        'A new investment opportunity has been posted: ' || NEW.title,
        jsonb_build_object(
          'deal_id', NEW.id,
          'deal_slug', regexp_replace(lower(NEW.title), '[^a-z0-9]+', '-', 'g'),
          'syndicator_name', syndicator_name
        )
      );

      -- Check if user wants deal notifications
      IF (investor_record.email_notifications->>'deal_updates')::boolean THEN
        -- Send email via Edge Function
        PERFORM pg_notify(
          'email_notifications',
          json_build_object(
            'to', investor_record.email,
            'subject', 'New Investment Opportunity from ' || syndicator_name,
            'content', format(
              E'A new investment opportunity has been posted:\\n\\n' ||
              'Property: %s\\n' ||
              'Location: %s\\n' ||
              'Type: %s\\n' ||
              'Minimum Investment: $%s\\n' ||
              'Target IRR: %s%%\\n' ||
              'Investment Term: %s years\\n\\n' ||
              'Click below to view the full details and investment materials.',
              NEW.title,
              NEW.location,
              NEW.property_type,
              to_char(NEW.minimum_investment, 'FM999,999,999'),
              NEW.target_irr,
              NEW.investment_term
            ),
            'type', 'deal_update',
            'data', json_build_object(
              'deal_id', NEW.id,
              'deal_slug', regexp_replace(lower(NEW.title), '[^a-z0-9]+', '-', 'g')
            )
          )::text
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new deals
DROP TRIGGER IF EXISTS on_new_deal ON deals;
CREATE TRIGGER on_new_deal
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_deal_notification();
;
