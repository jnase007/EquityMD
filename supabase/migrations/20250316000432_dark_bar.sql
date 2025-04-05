/*
  # Add Subscription and Credit System

  1. New Tables
    - `subscriptions`
      - Track active subscriptions and billing details
    - `subscription_tiers`
      - Define available subscription tiers and features
    - `credits`
      - Track credit balances and usage
    - `credit_transactions`
      - Log credit purchases and usage

  2. Security
    - Enable RLS on all tables
    - Add policies for subscription management
*/

-- Create subscription tiers table
CREATE TABLE subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  monthly_price integer NOT NULL,
  annual_price integer NOT NULL,
  credits_per_month integer NOT NULL,
  extra_credit_price numeric(10,2) NOT NULL,
  features jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES subscription_tiers(id),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  billing_interval text NOT NULL CHECK (billing_interval IN ('monthly', 'annual')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credits table
CREATE TABLE credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create credit transactions table
CREATE TABLE credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('subscription_credit', 'purchase', 'usage')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view subscription tiers"
  ON subscription_tiers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = syndicator_id);

CREATE POLICY "Users can view own credits"
  ON credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = syndicator_id);

CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = syndicator_id);

-- Insert subscription tiers
INSERT INTO subscription_tiers (name, monthly_price, annual_price, credits_per_month, extra_credit_price, features) VALUES
  (
    'Starter',
    149,
    1490,
    60,
    2.50,
    '[
      "Access to browse 10K investor database (view-only)",
      "Basic listing features",
      "Standard search filters",
      "Text description",
      "Single photo per listing",
      "Basic analytics"
    ]'::jsonb
  ),
  (
    'Pro',
    349,
    3490,
    150,
    2.00,
    '[
      "Full access to 10K investor database",
      "Enhanced listings with video uploads",
      "Up to 5 photos per listing",
      "Priority placement in search",
      "Monthly email blast to all investors",
      "Advanced analytics dashboard",
      "Investor profile access"
    ]'::jsonb
  ),
  (
    'Elite',
    699,
    6990,
    360,
    1.50,
    '[
      "Full database access with advanced filters",
      "Premium listings with virtual tours",
      "Unlimited photos per listing",
      "Guaranteed \"Deal Spotlight\" monthly",
      "Dedicated email blast to investors",
      "Real-time analytics",
      "Direct investor messaging",
      "Priority support"
    ]'::jsonb
  );

-- Create function to handle credit updates
CREATE OR REPLACE FUNCTION handle_credit_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credit updates
CREATE TRIGGER on_credit_update
  BEFORE UPDATE ON credits
  FOR EACH ROW
  EXECUTE FUNCTION handle_credit_update();

-- Create function to handle subscription updates
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription updates
CREATE TRIGGER on_subscription_update
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_update();

-- Create function to handle monthly credit reset
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
DECLARE
  sub RECORD;
BEGIN
  FOR sub IN
    SELECT s.*, t.credits_per_month
    FROM subscriptions s
    JOIN subscription_tiers t ON t.id = s.tier_id
    WHERE s.status = 'active'
  LOOP
    -- Reset credits to monthly allocation
    UPDATE credits
    SET balance = sub.credits_per_month
    WHERE syndicator_id = sub.syndicator_id;

    -- Log transaction
    INSERT INTO credit_transactions (
      syndicator_id,
      amount,
      type,
      description
    ) VALUES (
      sub.syndicator_id,
      sub.credits_per_month,
      'subscription_credit',
      'Monthly credit reset'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;