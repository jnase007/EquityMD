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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create claim requests" ON syndicator_claim_requests;
  DROP POLICY IF EXISTS "Users can view own claim requests" ON syndicator_claim_requests;
  DROP POLICY IF EXISTS "Admins can manage claim requests" ON syndicator_claim_requests;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

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
DROP TRIGGER IF EXISTS update_syndicator_claim_requests_updated_at ON syndicator_claim_requests;
CREATE TRIGGER update_syndicator_claim_requests_updated_at
  BEFORE UPDATE ON syndicator_claim_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create placeholder syndicators
DO $$ 
DECLARE
  new_id uuid;
  new_profile_id uuid;
BEGIN
  -- Create profiles and syndicator profiles for any orphaned deals
  FOR new_id IN
    SELECT DISTINCT d.syndicator_id
    FROM deals d
    LEFT JOIN syndicator_profiles sp ON sp.id = d.syndicator_id
    WHERE sp.id IS NULL
  LOOP
    -- Generate profile ID
    SELECT gen_random_uuid() INTO new_profile_id;
    
    -- Create auth user
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
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_profile_id,
      'authenticated',
      'authenticated',
      'unclaimed-' || new_id || '@example.com',
      crypt('placeholder', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    );

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      user_type,
      is_verified,
      created_at,
      updated_at
    ) VALUES (
      new_profile_id,
      'unclaimed-' || new_id || '@example.com',
      (SELECT title FROM deals WHERE syndicator_id = new_id LIMIT 1),
      'syndicator',
      false,
      now(),
      now()
    );

    -- Create syndicator profile
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
    )
    SELECT
      new_profile_id,
      d.title,
      'Syndicator profile pending verification.',
      1,
      d.total_equity,
      split_part(d.location, ', ', 2),
      split_part(d.location, ', ', 1),
      null,
      true
    FROM deals d
    WHERE d.syndicator_id = new_id
    LIMIT 1;

    -- Update deals to point to new syndicator profile
    UPDATE deals
    SET syndicator_id = new_profile_id
    WHERE syndicator_id = new_id;
  END LOOP;
END $$;