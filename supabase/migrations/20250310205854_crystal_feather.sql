/*
  # Add dummy syndicator reviews

  1. New Data
    - Adds realistic dummy reviews for syndicator profiles
    - Includes varied ratings, detailed feedback, and timestamps
    - Associates reviews with existing profiles

  2. Review Content
    - Covers different aspects like:
      - Communication
      - Deal performance
      - Professionalism
      - Transparency
    - Mix of positive and constructive feedback
    - Realistic timestamps over the past year
*/

-- Create dummy users first
DO $$
DECLARE
  user_id uuid;
  profile_id uuid;
BEGIN
  FOR i IN 1..10 LOOP
    -- Create auth user
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
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'investor' || i || '@example.com',
      '$2a$10$Q7QJXD4pkqBW2qwkK2mhz.9qxpZlF1uV5GxorGq9vZZDqoTvXnSEu', -- dummy hashed password
      NOW(),
      NOW(),
      NOW()
    ) RETURNING id INTO user_id;

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      user_type,
      is_verified,
      created_at
    ) VALUES (
      user_id,
      'investor' || i || '@example.com',
      'Investor ' || i,
      'investor',
      true,
      NOW() - (random() * interval '1 year')
    ) RETURNING id INTO profile_id;

    -- Create investor profile
    INSERT INTO investor_profiles (id)
    VALUES (profile_id);
  END LOOP;
END $$;

-- Add reviews for Summit Capital Partners
INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Summit Capital Partners' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor1@example.com'),
  5,
  'Outstanding experience working with Summit Capital. Their attention to detail and transparent communication throughout the investment process was exceptional. The quarterly reports are comprehensive and they''re always available to answer questions. Our multi-family investment has performed above projections.',
  NOW() - interval '3 months';

INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Summit Capital Partners' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor2@example.com'),
  4,
  'Professional team with a solid track record. While the initial onboarding took longer than expected, their asset management has been top-notch. They''ve successfully navigated market challenges and maintained consistent distributions.',
  NOW() - interval '6 months';

-- Add reviews for Horizon Investment Group
INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Horizon Investment Group' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor3@example.com'),
  5,
  'Horizon''s expertise in industrial properties is unmatched. Their market analysis and deal selection process is thorough, and they''ve consistently delivered strong returns. The team''s knowledge of e-commerce trends has proven invaluable.',
  NOW() - interval '2 months';

INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Horizon Investment Group' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor4@example.com'),
  4,
  'Very satisfied with Horizon''s performance. Their focus on logistics and distribution centers has proven prescient. Communication could be more frequent, but the results speak for themselves.',
  NOW() - interval '5 months';

-- Add reviews for Metropolitan Real Estate
INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Metropolitan Real Estate' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor5@example.com'),
  5,
  'Metropolitan''s mixed-use developments have been transformative for the communities they''re in. Their ability to create value through thoughtful design and tenant mix is impressive. Returns have exceeded expectations.',
  NOW() - interval '1 month';

INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Metropolitan Real Estate' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor6@example.com'),
  3,
  'While the projects are well-executed, recent delays in construction have been concerning. Communication during these delays could have been better. Still, the long-term potential looks promising.',
  NOW() - interval '4 months';

-- Add reviews for Innovation Healthcare Properties
INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Innovation Healthcare Properties' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor7@example.com'),
  5,
  'Innovation Healthcare has demonstrated deep expertise in medical office buildings. Their relationships with healthcare providers ensure high occupancy rates and stable returns. Excellent reporting and investor communications.',
  NOW() - interval '2 months';

INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Innovation Healthcare Properties' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor8@example.com'),
  4,
  'Strong performer in the healthcare real estate sector. Their understanding of medical tenant needs and regulatory requirements sets them apart. Would appreciate more frequent market updates.',
  NOW() - interval '7 months';

-- Add reviews for Evergreen Residential
INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Evergreen Residential' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor9@example.com'),
  5,
  'Evergreen''s commitment to sustainable development is impressive. Their properties command premium rents and attract quality tenants. The energy efficiency measures have notably reduced operating costs.',
  NOW() - interval '1 month';

INSERT INTO syndicator_reviews (syndicator_id, reviewer_id, rating, review_text, created_at)
SELECT
  (SELECT id FROM syndicator_profiles WHERE company_name = 'Evergreen Residential' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'investor10@example.com'),
  4,
  'Innovative approach to residential development with a strong focus on sustainability. The smart home features are a real differentiator. Initial returns were slightly below projections but have improved over time.',
  NOW() - interval '3 months';