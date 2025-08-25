-- Insert highlighted deals (converted from frontend mock data)
DO $$ 
DECLARE
  backbay_id uuid;
  sutera_id uuid;
  starboard_id uuid;
BEGIN
  -- Get syndicator IDs (create them if they don't exist)
  
  -- Back Bay Capital
  SELECT id INTO backbay_id FROM syndicator_profiles WHERE company_name ILIKE '%Back Bay%';
  IF backbay_id IS NULL THEN
    INSERT INTO syndicator_profiles (
      company_name,
      company_description,
      years_in_business,
      total_deal_volume,
      created_at,
      updated_at
    ) VALUES (
      'Back Bay Capital',
      'Back Bay Investment Group specializes in real estate development and value-add projects across Southern California.',
      10,
      30000000,
      NOW(),
      NOW()
    ) RETURNING id INTO backbay_id;
  END IF;

  -- Sutera Properties  
  SELECT id INTO sutera_id FROM syndicator_profiles WHERE company_name ILIKE '%Sutera%';
  IF sutera_id IS NULL THEN
    INSERT INTO syndicator_profiles (
      company_name,
      company_description,
      company_logo_url,
      years_in_business,
      total_deal_volume,
      created_at,
      updated_at
    ) VALUES (
      'Sutera Properties',
      'Sutera is an emerging Multifamily Investment & Property Management firm based in Nashville, Tennessee focused on Value-Add Acquisitions and Management, primarily in the Southeast.',
      'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/syndicatorlogos/sutera.png',
      8,
      15000000,
      NOW(),
      NOW()
    ) RETURNING id INTO sutera_id;
  END IF;

  -- Starboard Realty
  -- SELECT id INTO starboard_id FROM syndicator_profiles WHERE company_name ILIKE '%Starboard%';
  -- IF starboard_id IS NULL THEN
  --   INSERT INTO syndicator_profiles (
  --     company_name,
  --     company_description,
  --     years_in_business,
  --     total_deal_volume,
  --     created_at,
  --     updated_at
  --   ) VALUES (
  --     'Starboard Realty',
  --     'Starboard Realty focuses on innovative real estate investment opportunities including ADU development and multi-family projects.',
  --     12,
  --     25000000,
  --     NOW(),
  --     NOW()
  --   ) RETURNING id INTO starboard_id;
  -- END IF;

  -- Insert the highlighted deals
  INSERT INTO deals (
    syndicator_id,
    title,
    description,
    property_type,
    location,
    address,
    investment_highlights,
    minimum_investment,
    target_irr,
    investment_term,
    total_equity,
    status,
    featured,
    highlighted,
    cover_image_url,
    created_at,
    updated_at
  ) VALUES
  -- Back Bay Deal 1
  (
    backbay_id,
    'San Diego Multi-Family Offering',
    'Back Bay Investment Group presents an opportunity to invest in a fund focused on multifamily development and value-add projects in Southern California. Leveraging the region''s robust economy, diverse job market, and housing demand, the fund aims to capitalize on the region''s housing shortage while delivering superior risk-adjusted returns.',
    'Multi-Family',
    'San Diego, CA',
    '{"street": "", "city": "San Diego", "state": "CA", "zip": ""}',
    ARRAY['Access to Institutional Grade Assets', 'Prime Residential Markets', 'Tax Deductions & Bonus Depreciation Benefits', 'Target 75% Cash on Cash', '15% Target Investor IRR', '1.75x Target Equity Multiple'],
    500000,
    15.0,
    5,
    10000000,
    'active',
    true,
    true,
    'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_SanDeigo.jpg',
    NOW(),
    NOW()
  ),
  -- Back Bay Deal 2
  (
    backbay_id,
    'Newport Beach Residential Offering',
    'Back Bay Investment Group is offering an exclusive opportunity to invest in residential real estate in Newport Beach and surrounding coastal communities, targeting high-demand neighborhoods with limited inventory and strong growth potential.',
    'Residential',
    'Newport Beach, CA',
    '{"street": "", "city": "Newport Beach", "state": "CA", "zip": ""}',
    ARRAY['Short Term Investment', 'Value-Add Strategy', 'Multiple Exit Options', 'Target 60% Cash on Cash', '20% Target Investor IRR', '1.6x Target Equity Multiple'],
    250000,
    20.0,
    2,
    10000000,
    'active',
    true,
    true,
    'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg',
    NOW(),
    NOW()
  ),
  -- Back Bay Deal 3
  (
    backbay_id,
    'Orange County Pref Equity Offering',
    'Back Bay Investment Group is offering a preferred equity investment with a fixed 15% annual return, paid quarterly, and a targeted holding period of 1–3 years. Designed for investors seeking secure, predictable income, this offering provides priority in the capital stack above common equity.',
    'Preferred Equity',
    'Newport Beach, CA',
    '{"street": "", "city": "Newport Beach", "state": "CA", "zip": ""}',
    ARRAY['Quarterly Payments', 'Fixed 15% Return', 'Priority in the Equity Stack', 'Target 45% Cash on Cash', '15% Target Investor IRR', '1.45x Target Equity Multiple'],
    100000,
    15.0,
    2,
    10000000,
    'active',
    true,
    true,
    'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_OrangeCounty.jpg',
    NOW(),
    NOW()
  ),
  -- Sutera Deal
  (
    sutera_id,
    'Greenville Apartment Complex',
    'Project Overview: Sutera Properties presents Liva, a ground-up multifamily development in Travelers Rest, South Carolina, a rapidly growing suburb of Greenville. The project spans 10.5 acres and includes 120 multifamily units and 32 individually platted townhomes, totaling 152 units. The site is 100% shovel-ready with Land Disturbance Permits secured as of March 2025.',
    'Multi-Family',
    'Travelers Rest, SC',
    '{"street": "", "city": "Travelers Rest", "state": "SC", "zip": ""}',
    ARRAY['Ground-up development', '152 total units (120 multifamily + 32 townhomes)', 'Resort-style amenities', 'Pool and clubhouse', 'Fitness center', 'Dog park and bike barn', 'Prime location near Swamp Rabbit Trail', 'Shovel-ready with permits secured'],
    50000,
    17.19,
    5,
    12340000,
    'active',
    true,
    true,
    'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0980.jpeg',
    NOW(),
    NOW()
  );
  -- Starboard Deal
  -- (
  --   starboard_id,
  --   'Multifamily ADU Opportunity',
  --   'Starboard Realty presents an innovative investment opportunity in Accessory Dwelling Unit (ADU) development across Southern California. This unique strategy leverages the state''s housing shortage and new ADU-friendly regulations to create high-yield investment opportunities in established neighborhoods.',
  --   'ADU',
  --   'Southern California',
  --   '{"street": "", "city": "Los Angeles", "state": "CA", "zip": ""}',
  --   ARRAY['Innovative ADU Strategy', 'High-Yield Opportunity', 'Established Neighborhoods', 'ADU-Friendly Regulations', 'Southern California Focus', 'Multiple Exit Strategies'],
  --   75000,
  --   18.0,
  --   3,
  --   8000000,
  --   'active',
  --   true,
  --   true,
  --   'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/adu-brochure-1.jpg',
  --   NOW(),
  --   NOW()
  -- );

END $$;