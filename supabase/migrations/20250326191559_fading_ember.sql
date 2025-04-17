DO $$ 
DECLARE
  test_id uuid;
BEGIN
  -- First check if test user already exists
  SELECT id INTO test_id
  FROM auth.users
  WHERE email = 'test.investor@equitymd.com';

  -- Only create new user if it doesn't exist
  IF test_id IS NULL THEN
    -- Create test investor user
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
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'test.investor@equitymd.com',
      crypt('Test123!', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ) RETURNING id INTO test_id;

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      user_type,
      is_verified,
      created_at,
      updated_at,
      referral_code
    ) VALUES (
      test_id,
      'test.investor@equitymd.com',
      'Test Investor',
      'investor',
      true,
      now(),
      now(),
      'TEST123'
    );

    -- Create investor profile
    INSERT INTO investor_profiles (
      id,
      accredited_status,
      minimum_investment,
      preferred_property_types,
      preferred_locations,
      risk_tolerance,
      investment_goals,
      multiplier_credits
    ) VALUES (
      test_id,
      true,
      100000,
      ARRAY['Multi-Family', 'Office', 'Medical'],
      ARRAY['New York', 'Miami', 'Austin'],
      'moderate',
      'Looking for long-term stable returns in commercial real estate',
      2
    );

    -- Add some test referrals
    INSERT INTO referrals (
      referrer_id,
      status,
      investment_amount,
      created_at
    ) VALUES 
      (test_id, 'completed', 250000, now() - interval '30 days'),
      (test_id, 'completed', 175000, now() - interval '15 days'),
      (test_id, 'pending', null, now() - interval '2 days');

    -- Add referral rewards
    INSERT INTO referral_rewards (
      referral_id,
      user_id,
      type,
      amount
    )
    SELECT 
      id,
      test_id,
      'multiplier_credit',
      1
    FROM referrals 
    WHERE referrer_id = test_id 
    AND status = 'completed';
  END IF;
END $$;
