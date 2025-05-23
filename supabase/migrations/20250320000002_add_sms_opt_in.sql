-- Add SMS opt-in fields to profiles table for TCPA compliance
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_opt_in_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add index for SMS opt-in queries
CREATE INDEX IF NOT EXISTS idx_profiles_sms_opt_in ON profiles(sms_opt_in) WHERE sms_opt_in = true;

-- Add phone number validation constraint
ALTER TABLE profiles 
ADD CONSTRAINT phone_number_format 
CHECK (phone_number IS NULL OR phone_number ~ '^\+1-\d{3}-\d{3}-\d{4}$');

-- Update RLS policies to allow users to update their own SMS preferences
CREATE POLICY "Users can update their own SMS preferences" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create SMS opt-in log table for compliance tracking
CREATE TABLE IF NOT EXISTS sms_opt_in_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('opt_in', 'opt_out')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  source TEXT DEFAULT 'profile_form'
);

-- Enable RLS on SMS opt-in log
ALTER TABLE sms_opt_in_log ENABLE ROW LEVEL SECURITY;

-- Policy for SMS opt-in log (admin read, user insert their own)
CREATE POLICY "Users can insert their own SMS opt-in log" ON sms_opt_in_log
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read SMS opt-in log" ON sms_opt_in_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Create function to handle SMS opt-in with logging
CREATE OR REPLACE FUNCTION handle_sms_opt_in(
  p_user_id UUID,
  p_opt_in BOOLEAN,
  p_phone_number TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update profile
  UPDATE profiles 
  SET 
    sms_opt_in = p_opt_in,
    sms_opt_in_timestamp = CASE WHEN p_opt_in THEN NOW() ELSE sms_opt_in_timestamp END,
    phone_number = COALESCE(p_phone_number, phone_number)
  WHERE id = p_user_id;

  -- Log the action
  INSERT INTO sms_opt_in_log (user_id, action, ip_address, user_agent)
  VALUES (
    p_user_id, 
    CASE WHEN p_opt_in THEN 'opt_in' ELSE 'opt_out' END,
    p_ip_address,
    p_user_agent
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_sms_opt_in TO authenticated; 