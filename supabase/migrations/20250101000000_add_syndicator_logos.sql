-- Update syndicator profiles with logo URLs from Supabase storage
-- Note: The actual URL will be constructed dynamically in the frontend using VITE_SUPABASE_URL
-- This migration sets the relative path that will be combined with the base URL

-- For Sutera Properties
UPDATE syndicator_profiles 
SET company_logo_url = '/storage/v1/object/public/syndicatorlogos/sutera.png'
WHERE company_name = 'Sutera Properties';

-- For Back Bay Capital  
UPDATE syndicator_profiles 
SET company_logo_url = '/storage/v1/object/public/syndicatorlogos/backbay.png'
WHERE company_name = 'Back Bay Capital'; 