/*
  # Add Referral System with Return Multiplier
  
  1. Changes
    - Add multiplier_credits column to track available credits
    - Add referral tracking and rewards
    - Update existing tables for referral functionality
    
  2. Security
    - Maintain existing RLS policies
    - Add policies for referral management
*/

-- Add multiplier credits to investor profiles
ALTER TABLE investor_profiles
ADD COLUMN multiplier_credits integer DEFAULT 0;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES profiles(id),
  referred_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  investment_amount numeric,
  multiplier_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(referrer_id, referred_id)
);

-- Create referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES referrals(id),
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL CHECK (type IN ('multiplier_credit', 'bonus')),
  amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals
CREATE POLICY "Users can view own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

-- Create policies for referral rewards
CREATE POLICY "Users can view own rewards"
  ON referral_rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle referral completion
CREATE OR REPLACE FUNCTION handle_referral_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Award multiplier credits to both referrer and referred
  UPDATE investor_profiles
  SET multiplier_credits = multiplier_credits + 1
  WHERE id IN (NEW.referrer_id, NEW.referred_id);

  -- Record rewards
  INSERT INTO referral_rewards (referral_id, user_id, type, amount)
  VALUES
    (NEW.id, NEW.referrer_id, 'multiplier_credit', 1),
    (NEW.id, NEW.referred_id, 'multiplier_credit', 1);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for referral completion
CREATE TRIGGER on_referral_completed
  AFTER UPDATE OF status ON referrals
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION handle_referral_completion();