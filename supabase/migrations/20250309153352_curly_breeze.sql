/*
  # Initial Schema Setup for EQUITYMD

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `location` (text)
      - `image_url` (text)
      - `target_irr` (text)
      - `minimum_investment` (text)
      - `investment_term` (text)
      - `property_type` (text)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `investors`
      - `id` (uuid, primary key, linked to auth.users)
      - `full_name` (text)
      - `accredited_status` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for reading and managing properties
    - Add policies for investor profiles
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  image_url text NOT NULL,
  target_irr text NOT NULL,
  minimum_investment text NOT NULL,
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

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

-- Policies for properties
CREATE POLICY "Anyone can view active properties"
  ON properties
  FOR SELECT
  USING (status = 'Active');

CREATE POLICY "Only admins can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for investors
CREATE POLICY "Users can view their own investor profile"
  ON investors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own investor profile"
  ON investors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own investor profile"
  ON investors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);