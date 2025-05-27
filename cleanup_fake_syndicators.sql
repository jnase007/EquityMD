-- Cleanup script to remove fake syndicators and clean up reviews
-- Only keep Back Bay Capital, Sutera Properties, and Starboard Realty

BEGIN;

-- First, let's identify the syndicators we want to keep
-- Get IDs of the three real syndicators
DO $$
DECLARE
    backbay_id UUID;
    sutera_id UUID;
    starboard_id UUID;
BEGIN
    -- Get the IDs of the syndicators we want to keep
    SELECT id INTO backbay_id FROM syndicator_profiles WHERE company_name = 'Back Bay Capital';
    SELECT id INTO sutera_id FROM syndicator_profiles WHERE company_name = 'Sutera Properties';
    SELECT id INTO starboard_id FROM syndicator_profiles WHERE company_name = 'Starboard Realty';

    -- Delete reviews for syndicators that are NOT the three real ones
    DELETE FROM syndicator_reviews 
    WHERE syndicator_id NOT IN (
        SELECT id FROM syndicator_profiles 
        WHERE company_name IN ('Back Bay Capital', 'Sutera Properties', 'Starboard Realty')
    );

    -- Delete deals for syndicators that are NOT the three real ones
    DELETE FROM deals 
    WHERE syndicator_id NOT IN (
        SELECT id FROM syndicator_profiles 
        WHERE company_name IN ('Back Bay Capital', 'Sutera Properties', 'Starboard Realty')
    );

    -- Delete deal interests for deals that no longer exist
    DELETE FROM deal_interests 
    WHERE deal_id NOT IN (SELECT id FROM deals);

    -- Delete favorites for deals that no longer exist
    DELETE FROM favorites 
    WHERE deal_id NOT IN (SELECT id FROM deals);

    -- Delete verification history for syndicators that will be deleted
    DELETE FROM syndicator_verification_history 
    WHERE syndicator_id NOT IN (
        SELECT id FROM syndicator_profiles 
        WHERE company_name IN ('Back Bay Capital', 'Sutera Properties', 'Starboard Realty')
    );

    -- Delete syndicator profiles that are NOT the three real ones
    DELETE FROM syndicator_profiles 
    WHERE company_name NOT IN ('Back Bay Capital', 'Sutera Properties', 'Starboard Realty');

    -- Delete profiles for syndicators that no longer exist
    DELETE FROM profiles 
    WHERE user_type = 'syndicator' 
    AND id NOT IN (SELECT id FROM syndicator_profiles);

    -- Delete auth users for profiles that no longer exist
    DELETE FROM auth.users 
    WHERE id NOT IN (SELECT id FROM profiles);

    -- Clean up any orphaned records
    DELETE FROM deal_files 
    WHERE deal_id NOT IN (SELECT id FROM deals);

    DELETE FROM deal_media 
    WHERE deal_id NOT IN (SELECT id FROM deals);

    -- Update verification status for the remaining syndicators
    UPDATE syndicator_profiles 
    SET verification_status = 'premier',
        verified_at = NOW(),
        verification_notes = 'Premier partner - verified real syndicator'
    WHERE company_name IN ('Back Bay Capital', 'Sutera Properties', 'Starboard Realty');

    RAISE NOTICE 'Cleanup completed successfully. Only Back Bay Capital, Sutera Properties, and Starboard Realty remain.';
END $$;

COMMIT; 