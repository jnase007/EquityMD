/*
  # Add Real Estate Syndicator Companies
  
  1. New Data
    - Add real estate syndicators if they don't already exist
    - Map company details to syndicator_profiles schema
    - Create corresponding auth users and profiles
    
  2. Security
    - Check for existing records before inserting
    - Maintain existing RLS policies
    - Use proper password hashing
*/

DO $$ 
DECLARE
  profile_id uuid;
  company_email text;
  company_name text;
  company_website text;
  company_description text;
  company_city text;
  company_state text;
BEGIN
  -- Create a temporary table to store company data
  CREATE TEMP TABLE company_data (
    email text,
    name text,
    website text,
    description text,
    city text,
    state text
  );

  -- Insert company data
  INSERT INTO company_data VALUES
    ('info@wncinc.com', 'WNC', 'http://www.wncinc.com', 'WNC is a national investor in real estate and community development initiatives, specializing in affordable housing.', 'Irvine', 'California'),
    ('info@huntcapitalpartners.com', 'Hunt Capital Partners', 'http://www.huntcapitalpartners.com', 'Hunt Capital Partners is a leading affordable housing provider that has raised over $3.8 billion in tax credit equity to create housing for low-income families, seniors, and special needs households.', 'Los Angeles', 'California'),
    ('info@ashcroftcapital.com', 'Ashcroft Capital', 'http://www.ashcroftcapital.com', 'Ashcroft Capital is a vertically integrated investment firm specializing in acquiring and managing apartment communities across the Sun Belt.', 'New York', 'New York'),
    ('info@37parallel.com', '37th Parallel Properties', 'http://www.37parallel.com', '37th Parallel Properties is a multifamily real estate investment firm with a 100% profitable track record across $1 billion+ in transaction volume.', 'Richmond', 'Virginia'),
    ('info@prologis.com', 'Prologis', 'https://www.prologis.com/', 'Prologis is a leading owner, operator, and developer of industrial real estate, focusing on logistics facilities.', 'San Francisco', 'California'),
    ('info@simon.com', 'Simon Property Group', 'https://www.simon.com/', 'Simon Property Group is a real estate investment trust engaged in the ownership of premier shopping, dining, entertainment, and mixed-use destinations.', 'Indianapolis', 'Indiana');

  -- Process each company
  FOR company_email, company_name, company_website, company_description, company_city, company_state IN 
    SELECT email, name, website, description, city, state FROM company_data
  LOOP
    -- Check if company already exists
    IF NOT EXISTS (
      SELECT 1 FROM auth.users WHERE email = company_email
    ) THEN
      -- Generate new UUID
      SELECT gen_random_uuid() INTO profile_id;
      
      -- Create auth user
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        profile_id,
        'authenticated',
        'authenticated',
        company_email,
        crypt('placeholder', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now()
      );

      -- Create profile
      INSERT INTO profiles (
        id, email, full_name, user_type, is_verified
      ) VALUES (
        profile_id,
        company_email,
        company_name,
        'syndicator',
        true
      );

      -- Create syndicator profile
      INSERT INTO syndicator_profiles (
        id, company_name, company_description, website_url, city, state, claimable
      ) VALUES (
        profile_id,
        company_name,
        company_description,
        company_website,
        company_city,
        company_state,
        true
      );
    END IF;
  END LOOP;

  -- Drop temporary table
  DROP TABLE company_data;
END $$;