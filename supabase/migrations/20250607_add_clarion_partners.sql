-- Add Clarion Partners to the database
-- Migration created: 2025-06-07

DO $$ 
DECLARE
  clarion_id uuid := gen_random_uuid();
BEGIN
  -- Create auth user for Clarion Partners
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    clarion_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'info@clarionpartners.com',
    crypt('placeholder_password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"David Gilbert"}'::jsonb,
    now(),
    now()
  );

  -- Create profile entry
  INSERT INTO profiles (
    id,
    email,
    full_name,
    user_type,
    is_verified,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    clarion_id,
    'info@clarionpartners.com',
    'David Gilbert',
    'syndicator',
    true,
    false,
    now(),
    now()
  );

  -- Create syndicator profile
  INSERT INTO syndicator_profiles (
    id,
    company_name,
    company_description,
    company_logo_url,
    years_in_business,
    total_deal_volume,
    state,
    city,
    website_url,
    verification_status,
    verified_at,
    verification_notes,
    claimable,
    created_at,
    updated_at
  ) VALUES (
    clarion_id,
    'Clarion Partners',
    'Clarion Partners is a leading global real estate investment company with over 40 years of experience, managing $73.1 billion in assets under management. We combine our broad scale and execution capabilities with our deep market and property expertise to identify and leverage the true drivers of long-term value in real estate. Our investment philosophy is rooted in extensive research and expert judgment, allowing us to anticipate trends and identify opportunities across the risk/return spectrum in industrial, multifamily, office, retail, hotel, life science/lab office, and student housing sectors.',
    'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/syndicatorlogos//clarionpartners.png',
    40,
    73100000000, -- $73.1 billion in AUM
    'New York',
    'New York',
    'https://www.clarionpartners.com/',
    'verified',
    now(),
    'Major institutional real estate investment manager - verified via official website and public records',
    true,
    now(),
    now()
  );

  RAISE NOTICE 'Successfully added Clarion Partners (ID: %) to the database', clarion_id;
END $$; 