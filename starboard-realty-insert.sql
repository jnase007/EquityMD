-- Insert Starboard Realty into syndicator_profiles table
INSERT INTO syndicator_profiles (
    id,
    company_name,
    company_description,
    company_logo_url,
    state,
    city,
    years_in_business,
    total_deal_volume,
    website_url,
    slug,
    created_at,
    updated_at
) VALUES (
    'starboard-realty-uuid',
    'Starboard Realty',
    'Headquartered in Irvine, California, Starboard Realty Advisors, LLC, is a privately held, fully-integrated real estate firm, whose principals have more than 30 years of hands-on, cycle-tested experience in acquiring, developing, leasing, repositioning, managing, financing and disposing of retail, multifamily, office and industrial real estate. Starboard acquires multifamily, multi-tenant retail shopping centers, and NNN lease properties. Starboard''s mission is to acquire well-located properties across the U.S., in which current rents have growth potential and which can be acquired at below replacement cost. Starboard acquires primarily stabilized properties with a 7- to 10-year hold period for its 1031 exchange clients and value added properties with a 1- to 5-year hold.',
    'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//Starboard_reality.jpg',
    'California',
    'Newport Beach',
    10,
    608000000,
    'https://starboard-realty.com/',
    'starboard-realty',
    NOW(),
    NOW()
) ON CONFLICT (company_name) DO UPDATE SET
    company_description = EXCLUDED.company_description,
    company_logo_url = EXCLUDED.company_logo_url,
    state = EXCLUDED.state,
    city = EXCLUDED.city,
    years_in_business = EXCLUDED.years_in_business,
    total_deal_volume = EXCLUDED.total_deal_volume,
    website_url = EXCLUDED.website_url,
    slug = EXCLUDED.slug,
    updated_at = NOW();

-- Note: You'll need to replace 'starboard-realty-uuid' with an actual UUID
-- You can generate one using: SELECT gen_random_uuid(); 