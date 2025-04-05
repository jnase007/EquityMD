/*
  # Update Investor Profiles

  1. Changes
    - Updates existing investor profiles with medical professional names and details
    - Adds more professional profile information
    - Focuses on healthcare-related investment preferences

  2. Security
    - No changes to security policies
    - Maintains existing RLS
*/

-- Update existing profiles with medical professional names
UPDATE profiles
SET 
  full_name = CASE id
    WHEN 'c9ea70cf-c068-4bb6-9a16-a6f03ee1fe2e' THEN 'Dr. Sarah Chen'
    WHEN 'e2f46706-c139-4e84-ba26-cd83387dadc4' THEN 'Dr. Michael Thompson'
    WHEN '27808d2b-e958-4b44-8b78-dd0f4f761f0d' THEN 'Dr. Emily Rodriguez'
    WHEN '40271c72-1419-4243-864f-9098e922d898' THEN 'Dr. James Wilson'
    WHEN '5c87a122-5428-4870-857a-feadb231b152' THEN 'Dr. Lisa Patel'
    WHEN 'afeec23b-e3e4-43cf-b6ad-cca7cc48c835' THEN 'Dr. Robert Kim'
    WHEN 'a525c608-62ed-4cf1-85e6-0edd67af06ac' THEN 'Dr. Maria Garcia'
    WHEN '7a34b931-b077-48c7-b826-a58523eb132a' THEN 'Dr. David Chang'
    WHEN 'c1594b85-3df5-4cce-a28f-d9991b6def3f' THEN 'Dr. Rachel Anderson'
    ELSE full_name
  END;

-- Update investor profiles with medical focus
UPDATE investor_profiles
SET
  preferred_property_types = ARRAY['Medical Office', 'Healthcare Facilities', 'Life Sciences'],
  minimum_investment = 
    CASE (RANDOM() * 4)::INT
      WHEN 0 THEN 100000
      WHEN 1 THEN 250000
      WHEN 2 THEN 500000
      ELSE 1000000
    END,
  investment_preferences = jsonb_build_object(
    'experience_level', 'expert',
    'focus_areas', ARRAY['Healthcare Real Estate', 'Medical Facilities', 'Life Sciences'],
    'target_markets', ARRAY['Boston', 'San Francisco', 'Houston', 'Chicago', 'Miami'],
    'investment_strategy', 'Long-term appreciation with stable income from medical office and healthcare facilities'
  );