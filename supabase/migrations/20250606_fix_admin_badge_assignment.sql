-- Fix Admin Badge Assignment Issue
-- This migration ensures only justin@brandastic.com is admin

-- 1. First, fix all existing users who incorrectly have admin status
UPDATE profiles 
SET is_admin = false
WHERE is_admin = true
  AND id NOT IN (
    SELECT id FROM auth.users WHERE email = 'justin@brandastic.com'
  );

-- 2. Ensure all users have a proper user_type (default to investor if null)
UPDATE profiles 
SET user_type = 'investor'
WHERE user_type IS NULL 
  AND is_admin = false;

-- 3. Update the existing trigger function to be more explicit
CREATE OR REPLACE FUNCTION make_justin_admin()
RETURNS trigger AS $$
BEGIN
  -- ONLY make justin@brandastic.com admin, all others are non-admin
  IF NEW.email = 'justin@brandastic.com' THEN
    NEW.is_admin = true;
    NEW.user_type = 'syndicator';
    NEW.is_verified = true;
  ELSE
    -- Explicitly ensure all other users are NOT admin
    NEW.is_admin = false;
    -- Set default user_type if not provided
    IF NEW.user_type IS NULL THEN
      NEW.user_type = 'investor';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS auto_make_justin_admin ON profiles;
CREATE TRIGGER auto_make_justin_admin
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION make_justin_admin();

-- 5. Add a constraint to prevent accidentally setting users as admin
-- (This will block any attempt to set is_admin = true unless it's for justin@brandastic.com)
CREATE OR REPLACE FUNCTION check_admin_assignment()
RETURNS trigger AS $$
BEGIN
  -- If trying to set is_admin = true, verify it's for justin@brandastic.com
  IF NEW.is_admin = true AND NEW.email != 'justin@brandastic.com' THEN
    RAISE EXCEPTION 'Only justin@brandastic.com can be set as admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the constraint trigger
DROP TRIGGER IF EXISTS check_admin_assignment_trigger ON profiles;
CREATE TRIGGER check_admin_assignment_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_assignment();

-- 6. Verification queries (these will show the results)
DO $$
BEGIN
  RAISE NOTICE 'Admin users after migration:';
  PERFORM email, user_type, is_admin 
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.is_admin = true;
END
$$; 