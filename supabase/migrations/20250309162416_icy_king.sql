/*
  # Add test data for development

  1. Test Users
    - Create an investor account
    - Create a syndicator account
    - Add their profiles and type-specific profiles
  
  2. Sample Deals
    - Add 3 active deals with different property types
    - Set one as featured
*/

-- Create test syndicator
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'syndicator@test.com');

INSERT INTO public.profiles (id, email, full_name, user_type, is_verified) VALUES
  ('11111111-1111-1111-1111-111111111111', 'syndicator@test.com', 'John Smith', 'syndicator', true);

INSERT INTO public.syndicator_profiles 
  (id, company_name, company_description, years_in_business, total_deal_volume) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Smith Real Estate Group', 'Premier real estate investment firm specializing in value-add opportunities', 15, 250000000);

-- Create test investor
INSERT INTO auth.users (id, email) VALUES
  ('22222222-2222-2222-2222-222222222222', 'investor@test.com');

INSERT INTO public.profiles (id, email, full_name, user_type, is_verified) VALUES
  ('22222222-2222-2222-2222-222222222222', 'investor@test.com', 'Jane Doe', 'investor', true);

INSERT INTO public.investor_profiles 
  (id, accredited_status, minimum_investment, preferred_property_types, risk_tolerance) VALUES
  ('22222222-2222-2222-2222-222222222222', true, 50000, ARRAY['Multi-Family', 'Office'], 'moderate');

-- Create sample deals
INSERT INTO public.deals 
  (syndicator_id, title, description, property_type, location, minimum_investment, target_irr, investment_term, total_equity, status, featured, cover_image_url) 
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'The Heights at Austin',
    'Luxury multi-family development in rapidly growing Austin tech corridor',
    'Multi-Family',
    'Austin, TX',
    50000,
    18.5,
    5,
    25000000,
    'active',
    true,
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Silicon Valley Office Plaza',
    'Class A office building in prime Silicon Valley location',
    'Office',
    'San Jose, CA',
    100000,
    15.0,
    7,
    45000000,
    'active',
    false,
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Denver Medical Center',
    'State-of-the-art medical office building near major hospital',
    'Medical',
    'Denver, CO',
    75000,
    16.5,
    6,
    30000000,
    'active',
    false,
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80'
  );