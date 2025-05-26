-- Clean up test accounts and set verification statuses

-- First, delete deals associated with test syndicators
DELETE FROM deals 
WHERE syndicator_id IN (
  SELECT sp.id 
  FROM syndicator_profiles sp
  JOIN profiles p ON sp.id = p.id
  WHERE p.email IN (
    'syndicator@test.com',
    'test.syndicator@equitymd.com',
    'test.investor@equitymd.com',
    'developer@equitymd.com'
  )
  OR sp.company_name IN (
    'John Smith',
    'Test Syndicator',
    'Justin Nassie',
    'Developer Admin',
    'Smith Real Estate Group',
    'Test Syndication Group',
    'Developer Team'
  )
);

-- Delete syndicator profiles for test accounts
DELETE FROM syndicator_profiles 
WHERE id IN (
  SELECT sp.id 
  FROM syndicator_profiles sp
  JOIN profiles p ON sp.id = p.id
  WHERE p.email IN (
    'syndicator@test.com',
    'test.syndicator@equitymd.com',
    'test.investor@equitymd.com',
    'developer@equitymd.com'
  )
  OR sp.company_name IN (
    'John Smith',
    'Test Syndicator',
    'Justin Nassie',
    'Developer Admin',
    'Smith Real Estate Group',
    'Test Syndication Group',
    'Developer Team'
  )
);

-- Delete investor profiles for test accounts
DELETE FROM investor_profiles 
WHERE id IN (
  SELECT p.id 
  FROM profiles p
  WHERE p.email IN (
    'syndicator@test.com',
    'test.syndicator@equitymd.com',
    'test.investor@equitymd.com',
    'developer@equitymd.com'
  )
  OR p.full_name IN (
    'John Smith',
    'Test Syndicator',
    'Justin Nassie',
    'Developer Admin',
    'Test Investor'
  )
);

-- Delete profiles for test accounts
DELETE FROM profiles 
WHERE email IN (
  'syndicator@test.com',
  'test.syndicator@equitymd.com',
  'test.investor@equitymd.com',
  'developer@equitymd.com'
)
OR full_name IN (
  'John Smith',
  'Test Syndicator',
  'Justin Nassie',
  'Developer Admin',
  'Test Investor'
);

-- Delete auth users for test accounts
DELETE FROM auth.users 
WHERE email IN (
  'syndicator@test.com',
  'test.syndicator@equitymd.com',
  'test.investor@equitymd.com',
  'developer@equitymd.com'
);

-- Set all syndicators to unverified first
UPDATE syndicator_profiles 
SET verification_status = 'unverified',
    verified_at = NULL,
    verified_by = NULL,
    verification_notes = 'Reset to unverified status'
WHERE verification_status IS NOT NULL;

-- Set specific syndicators to verified status
UPDATE syndicator_profiles 
SET verification_status = 'premium',
    verified_at = NOW(),
    verification_notes = 'Premium partner status'
WHERE company_name IN ('Back Bay Capital', 'Sutera Properties');

UPDATE syndicator_profiles 
SET verification_status = 'featured',
    verified_at = NOW(),
    verification_notes = 'Featured syndicator status'
WHERE company_name = 'Starboard Realty';

-- Clean up any orphaned records
DELETE FROM deal_interests 
WHERE investor_id NOT IN (SELECT id FROM profiles)
OR deal_id NOT IN (SELECT id FROM deals);

DELETE FROM favorites 
WHERE investor_id NOT IN (SELECT id FROM profiles)
OR deal_id NOT IN (SELECT id FROM deals);

-- Clean up verification history for deleted accounts
DELETE FROM syndicator_verification_history 
WHERE syndicator_id NOT IN (SELECT id FROM syndicator_profiles); 