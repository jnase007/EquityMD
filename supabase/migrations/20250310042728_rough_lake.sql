DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM properties 
    WHERE title ILIKE '%Sutera%'
  ) THEN
    UPDATE properties 
    SET location = 'Nashville, TN'
    WHERE title ILIKE '%Sutera%';
  END IF;
END $$;
