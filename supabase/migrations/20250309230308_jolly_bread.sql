-- Create demo users in auth schema
INSERT INTO auth.users (id, email)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'info@suteraproperties.com'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'info@backbay.capital')
ON CONFLICT (id) DO NOTHING;

-- Create profiles
INSERT INTO profiles (id, email, full_name, user_type, is_verified)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'info@suteraproperties.com', 'Sutera Properties', 'syndicator', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'info@backbay.capital', 'Back Bay Capital', 'syndicator', true)
ON CONFLICT (id) DO NOTHING;

-- Create syndicator profiles
INSERT INTO syndicator_profiles (
  id, company_name, company_description, years_in_business, 
  total_deal_volume, state, city, website_url
)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Sutera Properties',
    'Sutera Properties is a leading real estate investment and development firm specializing in value-add multifamily and mixed-use properties across the United States.',
    15,
    250000000,
    'California',
    'San Francisco',
    'https://suteraproperties.com'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Back Bay Capital',
    'Back Bay Capital is a private equity real estate investment firm focused on acquiring and managing institutional quality commercial real estate assets.',
    12,
    180000000,
    'Massachusetts',
    'Boston',
    'https://backbay.capital'
  )
ON CONFLICT (id) DO NOTHING;

-- Add some sample deals for each syndicator
INSERT INTO deals (
  id, syndicator_id, title, description, property_type,
  location, minimum_investment, target_irr, investment_term,
  total_equity, status, featured
)
VALUES
  (
    gen_random_uuid(),
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'The Marina Residences',
    'Luxury waterfront multifamily development with 200 units',
    'Multi-Family',
    'San Francisco, CA',
    100000,
    18,
    5,
    45000000,
    'active',
    true
  ),
  (
    gen_random_uuid(),
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Innovation Square',
    'Class A office complex in Boston''s innovation district',
    'Office',
    'Boston, MA',
    75000,
    15,
    7,
    35000000,
    'active',
    true
  )
ON CONFLICT (id) DO NOTHING;
;
