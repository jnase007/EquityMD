-- Create past_projects table for completed syndicator projects
CREATE TABLE IF NOT EXISTS past_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicator_id uuid NOT NULL REFERENCES syndicator_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  units integer,
  sqft text,
  total_value text NOT NULL,
  irr text NOT NULL,
  exit_year integer NOT NULL,
  image_url text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE past_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view past projects"
  ON past_projects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Syndicators can manage their own past projects"
  ON past_projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM syndicator_profiles
      WHERE id = syndicator_id
      AND claimed_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM syndicator_profiles
      WHERE id = syndicator_id
      AND claimed_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all past projects"
  ON past_projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_past_projects_updated_at
  BEFORE UPDATE ON past_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_past_projects_syndicator_id ON past_projects(syndicator_id);
CREATE INDEX IF NOT EXISTS idx_past_projects_exit_year ON past_projects(exit_year);
