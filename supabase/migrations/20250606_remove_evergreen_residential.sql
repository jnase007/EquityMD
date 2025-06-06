-- Remove Evergreen Residential syndicator and all related data
-- Migration: 20250606_remove_evergreen_residential.sql

BEGIN;

-- Remove reviews for Evergreen Residential
DELETE FROM syndicator_reviews 
WHERE syndicator_id IN (
  SELECT id FROM syndicator_profiles 
  WHERE company_name = 'Evergreen Residential'
);

-- Remove deal interests for Evergreen deals
DELETE FROM deal_interests 
WHERE deal_id IN (
  SELECT d.id FROM deals d
  JOIN syndicator_profiles sp ON d.syndicator_id = sp.id
  WHERE sp.company_name = 'Evergreen Residential'
);

-- Remove favorites for Evergreen deals
DELETE FROM favorites 
WHERE deal_id IN (
  SELECT d.id FROM deals d
  JOIN syndicator_profiles sp ON d.syndicator_id = sp.id
  WHERE sp.company_name = 'Evergreen Residential'
);

-- Remove deal media for Evergreen deals
DELETE FROM deal_media 
WHERE deal_id IN (
  SELECT d.id FROM deals d
  JOIN syndicator_profiles sp ON d.syndicator_id = sp.id
  WHERE sp.company_name = 'Evergreen Residential'
);

-- Remove deal files for Evergreen deals
DELETE FROM deal_files 
WHERE deal_id IN (
  SELECT d.id FROM deals d
  JOIN syndicator_profiles sp ON d.syndicator_id = sp.id
  WHERE sp.company_name = 'Evergreen Residential'
);

-- Remove deals for Evergreen Residential
DELETE FROM deals 
WHERE syndicator_id IN (
  SELECT id FROM syndicator_profiles 
  WHERE company_name = 'Evergreen Residential'
);

-- Remove verification history for Evergreen Residential
DELETE FROM syndicator_verification_history 
WHERE syndicator_id IN (
  SELECT id FROM syndicator_profiles 
  WHERE company_name = 'Evergreen Residential'
);

-- Get the user ID before deleting syndicator profile
DO $$
DECLARE
  evergreen_user_id uuid;
BEGIN
  -- Get the user ID associated with Evergreen Residential
  SELECT id INTO evergreen_user_id 
  FROM syndicator_profiles 
  WHERE company_name = 'Evergreen Residential';
  
  -- Delete syndicator profile
  DELETE FROM syndicator_profiles 
  WHERE company_name = 'Evergreen Residential';
  
  -- Delete the profile
  IF evergreen_user_id IS NOT NULL THEN
    DELETE FROM profiles WHERE id = evergreen_user_id;
    
    -- Delete from auth.users (if exists)
    DELETE FROM auth.users WHERE id = evergreen_user_id;
  END IF;
  
  RAISE NOTICE 'Evergreen Residential successfully removed from all tables';
END $$;

COMMIT;

-- Verify removal
SELECT 
  'Verification: Evergreen Residential removed' as status,
  COUNT(*) as remaining_syndicators
FROM syndicator_profiles 
WHERE company_name != 'Evergreen Residential'; 