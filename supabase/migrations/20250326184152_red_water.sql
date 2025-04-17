-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create new policies for profiles
CREATE POLICY "Enable insert for authentication service"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id OR  -- Users can view their own profile
    auth.role() = 'authenticated'  -- Authenticated users can view other profiles
  );

CREATE POLICY "Enable update for users based on id"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Drop existing policies for investor_profiles
DROP POLICY IF EXISTS "Users can view own investor profile" ON investor_profiles;
DROP POLICY IF EXISTS "Users can update own investor profile" ON investor_profiles;

-- Create new policies for investor_profiles
CREATE POLICY "Enable insert for authentication service"
  ON investor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users"
  ON investor_profiles
  FOR SELECT
  USING (
    auth.uid() = id OR  -- Users can view their own profile
    auth.role() = 'authenticated'  -- Authenticated users can view other profiles
  );

CREATE POLICY "Enable update for users based on id"
  ON investor_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Drop existing policies for syndicator_profiles
DROP POLICY IF EXISTS "Users can view own syndicator profile" ON syndicator_profiles;
DROP POLICY IF EXISTS "Users can update own syndicator profile" ON syndicator_profiles;

-- Create new policies for syndicator_profiles
CREATE POLICY "Enable insert for authentication service"
  ON syndicator_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users"
  ON syndicator_profiles
  FOR SELECT
  USING (
    auth.uid() = id OR  -- Users can view their own profile
    auth.role() = 'authenticated'  -- Authenticated users can view other profiles
  );

CREATE POLICY "Enable update for users based on id"
  ON syndicator_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
