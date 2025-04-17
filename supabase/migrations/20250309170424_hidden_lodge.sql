-- Create test investor account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'e52e5b44-94c5-4f79-9559-3630ae2c0000',
  'authenticated',
  'authenticated',
  'test.investor@equitymd.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"user_type":"investor"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create test syndicator account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'e52e5b44-94c5-4f79-9559-3630ae2c0001',
  'authenticated',
  'authenticated',
  'test.syndicator@equitymd.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"user_type":"syndicator"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create investor profile
INSERT INTO public.profiles (
  id,
  email,
  user_type,
  full_name,
  is_verified
) VALUES (
  'e52e5b44-94c5-4f79-9559-3630ae2c0000',
  'test.investor@equitymd.com',
  'investor',
  'Test Investor',
  true
);

-- Create syndicator profile
INSERT INTO public.profiles (
  id,
  email,
  user_type,
  full_name,
  is_verified
) VALUES (
  'e52e5b44-94c5-4f79-9559-3630ae2c0001',
  'test.syndicator@equitymd.com',
  'syndicator',
  'Test Syndicator',
  true
);

-- Create investor specific profile
INSERT INTO public.investor_profiles (
  id,
  accredited_status,
  minimum_investment,
  preferred_property_types,
  preferred_locations,
  risk_tolerance,
  investment_goals
) VALUES (
  'e52e5b44-94c5-4f79-9559-3630ae2c0000',
  true,
  100000,
  ARRAY['Multi-Family', 'Office', 'Retail'],
  ARRAY['New York', 'California', 'Texas'],
  'moderate',
  'Looking for long-term stable returns in commercial real estate'
);

-- Create syndicator specific profile
INSERT INTO public.syndicator_profiles (
  id,
  company_name,
  company_description,
  years_in_business,
  total_deal_volume
) VALUES (
  'e52e5b44-94c5-4f79-9559-3630ae2c0001',
  'Test Syndication Group',
  'A leading real estate investment firm specializing in commercial properties',
  10,
  50000000
);

-- Add some test deals for the syndicator
INSERT INTO public.deals (
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
  featured
) VALUES (
  'e52e5b44-94c5-4f79-9559-3630ae2c0001',
  'Premium Office Complex',
  'Class A office building in prime location with long-term tenants',
  'Office',
  'New York, NY',
  ARRAY['Prime location', 'Long-term tenants', 'Strong cash flow'],
  100000,
  15,
  5,
  5000000,
  'active',
  true
),
(
  'e52e5b44-94c5-4f79-9559-3630ae2c0001',
  'Multi-Family Development',
  'New construction multi-family project in growing market',
  'Multi-Family',
  'Austin, TX',
  ARRAY['High growth market', 'New construction', 'Premium amenities'],
  75000,
  18,
  3,
  8000000,
  'active',
  true
);
;
