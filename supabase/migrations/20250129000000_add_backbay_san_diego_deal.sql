DO $$ 
DECLARE
  backbay_id uuid;
BEGIN
  -- Get Back Bay Capital syndicator ID
  SELECT id INTO backbay_id FROM syndicator_profiles WHERE company_name ILIKE '%Back Bay%';
  
  IF backbay_id IS NULL THEN
    RAISE EXCEPTION 'Back Bay Capital syndicator not found';
  END IF;

  -- Insert the new San Diego Multifamily deal
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
    cover_image_url,
    created_at,
    updated_at
  ) VALUES (
    backbay_id,
    'San Diego Multifamily Opportunity',
    'Prime residential multifamily investment opportunity in San Diego''s growing market. This institutional-grade asset offers investors access to strong cash flow, tax benefits including bonus depreciation, and the potential for significant returns in one of California''s most desirable markets.',
    'Multi-Family',
    'San Diego, CA',
    '{"street": "", "city": "San Diego", "state": "CA", "zip": ""}',
    ARRAY[
      'Access to Institutional Grade Assets',
      'Prime Residential Markets',
      'Tax Deductions & Bonus Depreciation Benefits',
      'Target 75% Cash on Cash',
      '15% Target Investor IRR',
      '1.75x Target Equity Multiple'
    ],
    500000,
    15.0,
    5,
    10000000,
    'active',
    true,
    'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg',
    NOW(),
    NOW()
  );

END $$; 