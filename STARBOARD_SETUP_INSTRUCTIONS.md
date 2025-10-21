# Starboard Realty Setup Instructions

## Step 1: Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the following SQL migration:

```sql
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
```

4. Click "Run" to execute the migration

## Step 2: Update Starboard Realty Average Return

Run this SQL to update the average return to 18.7%:

```sql
UPDATE syndicator_profiles 
SET average_return = 18.7 
WHERE company_name = 'Starboard Realty';
```

## Step 3: Add Past Projects

Run this SQL to add the 3 past projects:

```sql
-- Get Starboard Realty ID first
WITH starboard AS (
  SELECT id FROM syndicator_profiles WHERE company_name = 'Starboard Realty'
)
INSERT INTO past_projects (
  syndicator_id,
  name,
  location,
  type,
  units,
  total_value,
  irr,
  exit_year,
  image_url,
  description
)
SELECT 
  starboard.id,
  'Harper''s Retreat',
  'Conroe, TX',
  'Multi-Family',
  216,
  'Please Request',
  'Please Request',
  2023,
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/pastprojects/Screenshot%202025-10-21%20at%203.10.47%20PM.png',
  'Harper''s Retreat is a Class A low-rise community located north of Houston, TX. Complete with high end modern finishes and comprised of 1- and 2-bedroom units, the property provides residents with modern living and easy access to the jobs and entertainment of the Houston area.'
FROM starboard

UNION ALL

SELECT 
  starboard.id,
  'Arden Woods',
  'Spring, TX',
  'Multi-Family',
  308,
  'Please Request',
  'Please Request',
  2023,
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/pastprojects/Screenshot%202025-10-21%20at%203.13.10%20PM.png',
  'Arden Woods is a Class A garden-style community located north of Houston, TX. Comprised of 1-, 2-, and 3-bedroom units, the property features resort-style amenities and provides contemporary living with convenient access to everything Houston has to offer.'
FROM starboard

UNION ALL

SELECT 
  starboard.id,
  'The Dylan',
  'Fort Worth, TX',
  'Multi-Family',
  227,
  'Please Request',
  'Please Request',
  2023,
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/pastprojects/Screenshot%202025-10-21%20at%203.14.03%20PM.png',
  'The Dylan is a Class A, garden-style community comprised of 1-, 2-, 3-bedroom, and townhome-style units. The property is highly-amenitized with retail locations on the lower levels, which provides residents with luxury suburban living within minutes from downtown Fort Worth.'
FROM starboard;
```

## Step 4: Verify Setup

Run this query to verify everything was set up correctly:

```sql
-- Check average return
SELECT company_name, average_return 
FROM syndicator_profiles 
WHERE company_name = 'Starboard Realty';

-- Check past projects
SELECT name, location, units, exit_year 
FROM past_projects pp
JOIN syndicator_profiles sp ON pp.syndicator_id = sp.id
WHERE sp.company_name = 'Starboard Realty'
ORDER BY exit_year DESC;
```

## Expected Results

After running these queries, you should see:

1. **Average Return**: 18.7%
2. **Past Projects**: 3 projects (Harper's Retreat, Arden Woods, The Dylan)

The Starboard Realty profile at https://equitymd.com/syndicators/starboard-reality should now display:
- Average Return: 18.7%
- 3 past projects with images and descriptions
