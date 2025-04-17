-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  image_url text NOT NULL,
  target_irr numeric NOT NULL,  -- Changed to numeric for percentage/IRR value
  minimum_investment numeric NOT NULL,  -- Changed to numeric for investment amount
  investment_term text NOT NULL,
  property_type text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  accredited_status boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

-- Policies for properties table
-- Anyone can view active properties
CREATE POLICY "Anyone can view active properties"
  ON properties
  FOR SELECT
  USING (status = 'Active');

-- Only admins can insert properties
CREATE POLICY "Only admins can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Only admins can update properties
CREATE POLICY "Only admins can update properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for investors table
-- Users can view their own investor profile
CREATE POLICY "Users can view their own investor profile"
  ON investors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own investor profile
CREATE POLICY "Users can update their own investor profile"
  ON investors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own investor profile
CREATE POLICY "Users can insert their own investor profile"
  ON investors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
