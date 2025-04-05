/*
  # Update Sutera Properties Location

  1. Changes
    - Updates the location of Sutera Properties to Nashville, TN
*/

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