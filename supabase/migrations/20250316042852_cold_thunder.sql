/*
  # Add placeholder syndicator profiles and claiming functionality
  
  1. Changes
    - Add claimable flag to syndicator_profiles
    - Create claim requests table
    - Add RLS policies for claiming
    - Create placeholder syndicator profiles with proper auth users
    
  2. Security
    - Enable RLS on new tables
    - Add policies for claim requests
*/

-- Add claimable flag to syndicator_profiles
ALTER TABLE syndicator_profiles
ADD COLUMN IF NOT EXISTS claimable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES profiles(id);

-- Create claim requests table
CREATE TABLE IF NOT EXISTS syndicator_claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicator_id uuid REFERENCES syndicator_profiles(id),
  requester_id uuid REFERENCES profiles(id),
  company_email text NOT NULL,
  company_website text NOT NULL,
  proof_documents jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE syndicator_claim_requests ENABLE ROW LEVEL SECURITY;

-- Add policies for claim requests
CREATE POLICY "Users can create claim requests"
  ON syndicator_claim_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view own claim requests"
  ON syndicator_claim_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id);

CREATE POLICY "Admins can manage claim requests"
  ON syndicator_claim_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_syndicator_claim_requests_updated_at
  BEFORE UPDATE ON syndicator_claim_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create placeholder syndicators
DO $$ 
DECLARE
  cardone_id uuid := gen_random_uuid();
  blackstone_id uuid := gen_random_uuid();
  nuveen_id uuid := gen_random_uuid();
  dlp_id uuid := gen_random_uuid();
  crow_id uuid := gen_random_uuid();
BEGIN
  -- Create auth users first
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
    updated_at
  ) VALUES
    (
      '00000000-0000-0000-0000-000000000000',
      cardone_id,
      'authenticated',
      'authenticated',
      'invest@cardonecapital.com',
      crypt('placeholder', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      blackstone_id,
      'authenticated',
      'authenticated',
      'info@blackstone.com',
      crypt('placeholder', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      nuveen_id,
      'authenticated',
      'authenticated',
      'info@nuveen.com',
      crypt('placeholder', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      dlp_id,
      'authenticated',
      'authenticated',
      'info@dlpcapital.com',
      crypt('placeholder', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      crow_id,
      'authenticated',
      'authenticated',
      'info@crowholdings.com',
      crypt('placeholder', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
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
  ) VALUES
    (cardone_id, 'invest@cardonecapital.com', 'Cardone Capital', 'syndicator', true, now(), now()),
    (blackstone_id, 'info@blackstone.com', 'Blackstone Real Estate', 'syndicator', true, now(), now()),
    (nuveen_id, 'info@nuveen.com', 'Nuveen Real Estate', 'syndicator', true, now(), now()),
    (dlp_id, 'info@dlpcapital.com', 'DLP Capital', 'syndicator', true, now(), now()),
    (crow_id, 'info@crowholdings.com', 'Crow Holdings', 'syndicator', true, now(), now());

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
    claimable
  ) VALUES
    (
      cardone_id,
      'Cardone Capital',
      'Cardone Capital''s portfolio currently consists of 13,500+ units with a total value of $4.5 billion. Specializing in multifamily units, Cardone Capital raises money from the public by launching equity funds in which everyone can invest.',
      15,
      4500000000,
      'Florida',
      'Aventura',
      'https://cardonecapital.com',
      true
    ),
    (
      blackstone_id,
      'Blackstone Real Estate',
      'Blackstone is the world''s largest alternative asset manager, with more than $1 trillion in AUM. We serve institutional and individual investors. Blackstone is a global leader in real estate investing.',
      35,
      1000000000000,
      'New York',
      'New York',
      'https://blackstone.com',
      true
    ),
    (
      nuveen_id,
      'Nuveen Real Estate',
      'Nuveen Real Estate is one of the largest investment managers in the world with $147 billion of assets under management. With over 85 years of real estate investing experience.',
      85,
      147000000000,
      'New York',
      'New York',
      'https://nuveen.com',
      true
    ),
    (
      dlp_id,
      'DLP Capital',
      'DLP Capital is a private real estate investment and financial services company focused on making an IMPACT by acquiring, developing, and building relationships, housing, communities, and opportunities.',
      20,
      33000000000,
      'Florida',
      'St. Augustine',
      'https://dlpcapital.com',
      true
    ),
    (
      crow_id,
      'Crow Holdings',
      'Crow Holdings is a leading real estate investment and development firm whose founding principles are partnership, collaboration, and alignment of interests.',
      75,
      33000000000,
      'Texas',
      'Dallas',
      'https://crowholdings.com',
      true
    );
END $$;