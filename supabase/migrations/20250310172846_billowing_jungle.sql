-- Create site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_black text,
  logo_white text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site settings
CREATE POLICY "Public users can view site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can update site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ));

-- Insert initial record into site_settings
INSERT INTO site_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Create function to handle logo updates
CREATE OR REPLACE FUNCTION handle_logo_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for logo updates
CREATE TRIGGER on_logo_update
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_logo_update();
