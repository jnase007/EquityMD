/*
  # Grant Admin Privileges

  1. Changes
    - Updates the profile for admin@equitymd.com to have admin privileges
    - Sets verification status to true
    - Sets user type as investor for completeness

  2. Security
    - No changes to RLS policies
*/

UPDATE public.profiles
SET 
  is_admin = true,
  is_verified = true,
  user_type = 'investor'
WHERE email = 'admin@equitymd.com';