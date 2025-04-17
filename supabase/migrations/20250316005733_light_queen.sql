-- Create sample syndicators with dynamic UUIDs
DO $$ 
DECLARE
  summit_id uuid := gen_random_uuid();
  horizon_id uuid := gen_random_uuid();
  metro_id uuid := gen_random_uuid();
  innovation_id uuid := gen_random_uuid();
  evergreen_id uuid := gen_random_uuid();
BEGIN
  -- Create auth users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) 
  VALUES
    (
      '00000000-0000-0000-0000-000000000000',
      summit_id,
      'authenticated',
      'authenticated',
      'info@summitcapital.com',
      crypt('SummitCap2025!', gen_salt('bf')),
      now(),
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      horizon_id,
      'authenticated',
      'authenticated',
      'info@horizoninvest.com',
      crypt('HorizonInv2025!', gen_salt('bf')),
      now(),
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      metro_id,
      'authenticated',
      'authenticated',
      'info@metroreal.com',
      crypt('MetroRE2025!', gen_salt('bf')),
      now(),
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      innovation_id,
      'authenticated',
      'authenticated',
      'info@innovationhc.com',
      crypt('InnovHC2025!', gen_salt('bf')),
      now(),
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      evergreen_id,
      'authenticated',
      'authenticated',
      'info@evergreen.com',
      crypt('EverGreen2025!', gen_salt('bf')),
      now(),
      now(),
      now()
    );

  -- Create profiles
  INSERT INTO profiles (
    id,
    email,
    full_name,
    user_type,
    is_verified,
    created_at,
    updated_at
  )
  VALUES
    (summit_id, 'info@summitcapital.com', 'Summit Capital Partners', 'syndicator', true, now(), now()),
    (horizon_id, 'info@horizoninvest.com', 'Horizon Investment Group', 'syndicator', true, now(), now()),
    (metro_id, 'info@metroreal.com', 'Metropolitan Real Estate', 'syndicator', true, now(), now()),
    (innovation_id, 'info@innovationhc.com', 'Innovation Healthcare Properties', 'syndicator', true, now(), now()),
    (evergreen_id, 'info@evergreen.com', 'Evergreen Residential', 'syndicator', true, now(), now());

  -- Create syndicator profiles
  INSERT INTO syndicator_profiles (
    id,
    company_name,
    company_description,
    years_in_business,
    total_deal_volume,
    state,
    city,
    website_url,
    linkedin_url
  )
  VALUES
    (
      summit_id,
      'Summit Capital Partners',
      'Summit Capital Partners is a leading real estate investment firm...',
      22,
      1200000000,
      'Florida',
      'Miami',
      'https://summitcapital.com',
      'https://linkedin.com/company/summit-capital'
    ),
    (
      horizon_id,
      'Horizon Investment Group',
      'Horizon Investment Group focuses on emerging market opportunities...',
      15,
      800000000,
      'Texas',
      'Dallas',
      'https://horizoninvest.com',
      'https://linkedin.com/company/horizon-investment'
    ),
    (
      metro_id,
      'Metropolitan Real Estate',
      'Metropolitan Real Estate specializes in urban mixed-use developments...',
      18,
      1500000000,
      'California',
      'Los Angeles',
      'https://metroreal.com',
      'https://linkedin.com/company/metro-real'
    ),
    (
      innovation_id,
      'Innovation Healthcare Properties',
      'Innovation Healthcare Properties develops modern healthcare facilities...',
      12,
      600000000,
      'Massachusetts',
      'Boston',
      'https://innovationhc.com',
      'https://linkedin.com/company/innovation-hc'
    ),
    (
      evergreen_id,
      'Evergreen Residential',
      'Evergreen Residential focuses on sustainable multifamily developments...',
      10,
      400000000,
      'Washington',
      'Seattle',
      'https://evergreen.com',
      'https://linkedin.com/company/evergreen-residential'
    );

  -- Create sample deals
  INSERT INTO deals (
    syndicator_id,
    title,
    description,
    property_type,
    location,
    investment_highlights,
    minimum_investment,
    target_irr,
    investment_term,
    total_equity,
    status,
    featured,
    cover_image_url
  )
  VALUES
    (
      summit_id,
      'The Summit at Brickell',
      'Luxury multi-family development in Miami''s Brickell district...',
      'Multi-Family',
      'Miami, FL',
      ARRAY['Prime location', 'Luxury amenities', 'Strong rental market'],
      100000,
      18.5,
      5,
      50000000,
      'active',
      true,
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
    ),
    (
      horizon_id,
      'Horizon Logistics Center',
      'State-of-the-art logistics facility near major transportation hubs...',
      'Industrial',
      'Dallas, TX',
      ARRAY['Triple-net leases', 'Expansion potential'],
      250000,
      16.0,
      7,
      75000000,
      'active',
      true,
      'https://images.unsplash.com/photo-1553246969-7dcb4259a87b?auto=format&fit=crop&q=80'
    ),
    (
      metro_id,
      'The Metropolitan Downtown',
      'Mixed-use development in downtown LA combining apartments, retail...',
      'Mixed-Use',
      'Los Angeles, CA',
      ARRAY['Transit-oriented', 'Retail pre-leasing'],
      150000,
      17.5,
      6,
      60000000,
      'active',
      true,
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'
    ),
    (
      innovation_id,
      'Innovation Medical Plaza',
      'Modern medical office building next to hospital campus...',
      'Medical Office',
      'Boston, MA',
      ARRAY['100% medical tenancy', 'Long-term leases'],
      100000,
      15.0,
      5,
      40000000,
      'active',
      true,
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80'
    ),
    (
      evergreen_id,
      'Evergreen Apartments',
      'Sustainable apartment community with smart home tech and amenities...',
      'Multi-Family',
      'Seattle, WA',
      ARRAY['LEED Gold', 'Smart home features'],
      75000,
      16.5,
      5,
      35000000,
      'active',
      true,
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
    );
END $$;
