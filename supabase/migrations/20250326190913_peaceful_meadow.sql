-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id),
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  credits_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Add referral code to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8);

-- Create invite credits table
CREATE TABLE IF NOT EXISTS invite_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  invite_id uuid REFERENCES invites(id),
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'used')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for invites
CREATE POLICY "Users can create invites"
  ON invites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view own invites"
  ON invites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

-- Create policies for invite credits
CREATE POLICY "Users can view own credits"
  ON invite_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle invite acceptance
CREATE OR REPLACE FUNCTION handle_invite_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Award credits to both sender and recipient
  INSERT INTO invite_credits (user_id, invite_id, amount, type)
  VALUES
    (NEW.sender_id, NEW.id, 50, 'earned'),
    (auth.uid(), NEW.id, 50, 'earned');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invite acceptance
CREATE TRIGGER on_invite_accepted
  AFTER UPDATE OF status ON invites
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION handle_invite_acceptance();
