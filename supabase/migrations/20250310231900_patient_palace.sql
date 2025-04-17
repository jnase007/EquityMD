UPDATE public.profiles
SET 
  is_admin = true,
  is_verified = true,
  user_type = 'investor'
WHERE email = 'admin@equitymd.com';
;
