-- Create admin user if not exists
DO $$
DECLARE
  _user_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users if admin doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@equitymd.com'
  ) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
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
      _user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@equitymd.com',
      -- Use proper password hashing
      crypt('Admin123!', gen_salt('bf', 10)),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      jsonb_build_object(
        'role', 'admin'
      ),
      now(),
      now()
    );

    -- Create admin profile
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      user_type,
      is_admin,
      is_verified,
      created_at,
      updated_at
    ) VALUES (
      _user_id,
      'admin@equitymd.com',
      'System Administrator',
      'syndicator',
      true,
      true,
      now(),
      now()
    );

    -- Create syndicator profile
    INSERT INTO public.syndicator_profiles (
      id,
      company_name,
      company_description,
      created_at,
      updated_at
    ) VALUES (
      _user_id,
      'EQUITYMD Admin',
      'Platform administrator',
      now(),
      now()
    );

  END IF;
END $$;
;
