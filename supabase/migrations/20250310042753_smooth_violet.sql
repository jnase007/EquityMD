DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM properties 
    WHERE title ILIKE '%BackBay%'
  ) THEN
    UPDATE properties 
    SET location = 'Newport Beach, CA'
    WHERE title ILIKE '%BackBay%';
  END IF;
END $$;
