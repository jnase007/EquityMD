-- Update profiles with medical professional names and photos
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
  END,
  avatar_url = CASE id
    WHEN 'c9ea70cf-c068-4bb6-9a16-a6f03ee1fe2e' THEN 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80'
    WHEN 'e2f46706-c139-4e84-ba26-cd83387dadc4' THEN 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80'
    WHEN '27808d2b-e958-4b44-8b78-dd0f4f761f0d' THEN 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80'
    WHEN '40271c72-1419-4243-864f-9098e922d898' THEN 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80'
    WHEN '5c87a122-5428-4870-857a-feadb231b152' THEN 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80'
    WHEN 'afeec23b-e3e4-43cf-b6ad-cca7cc48c835' THEN 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80'
    WHEN 'a525c608-62ed-4cf1-85e6-0edd67af06ac' THEN 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80'
    WHEN '7a34b931-b077-48c7-b826-a58523eb132a' THEN 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80'
    WHEN 'c1594b85-3df5-4cce-a28f-d9991b6def3f' THEN 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80'
    ELSE avatar_url
  END;

-- Update investor profiles with medical focus and accreditation
UPDATE investor_profiles
SET
  accredited_status = true,
  preferred_property_types = ARRAY['Medical Office', 'Healthcare Facilities', 'Life Sciences'],
  minimum_investment = CASE floor(random() * 4)
    WHEN 0 THEN 100000
    WHEN 1 THEN 250000
    WHEN 2 THEN 500000
    ELSE 1000000
  END,
  investment_preferences = jsonb_build_object(
    'specialty', CASE floor(random() * 5)
      WHEN 0 THEN 'Cardiology'
      WHEN 1 THEN 'Orthopedics'
      WHEN 2 THEN 'Oncology'
      WHEN 3 THEN 'Neurology'
      ELSE 'Internal Medicine'
    END,
    'experience_level', 'expert',
    'focus_areas', ARRAY['Healthcare Real Estate', 'Medical Facilities', 'Life Sciences'],
    'target_markets', ARRAY['Boston', 'San Francisco', 'Houston', 'Chicago', 'Miami'],
    'investment_strategy', 'Long-term appreciation with stable income from medical office and healthcare facilities',
    'credentials', ARRAY['MD', 'FACP'],
    'hospital_affiliations', ARRAY['Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins']
  );
