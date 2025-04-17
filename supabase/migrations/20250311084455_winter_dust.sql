-- Create admin user function to handle the auth.users insert
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Insert into auth.users and get the ID
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'developer@equitymd.com',
    crypt('Developer123!', gen_salt('bf')),
    now(),
    now(),
    now()
  )
  RETURNING id INTO _user_id;

  -- Create profile with admin privileges
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    _user_id,
    'developer@equitymd.com',
    'Developer Admin',
    'syndicator',
    true,
    now(),
    now()
  );

  -- Create syndicator profile
  INSERT INTO public.syndicator_profiles (
    id,
    company_name,
    created_at,
    updated_at
  ) VALUES (
    _user_id,
    'Developer Team',
    now(),
    now()
  );
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();
