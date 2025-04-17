-- Function to add credits to a user's account
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_credits_id uuid;
BEGIN
  -- Validate input
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be positive';
  END IF;

  -- Get or create credits record
  SELECT id INTO v_credits_id FROM credits WHERE syndicator_id = p_user_id;
  
  IF v_credits_id IS NULL THEN
    INSERT INTO credits (syndicator_id, balance)
    VALUES (p_user_id, p_amount)
    RETURNING id INTO v_credits_id;
  ELSE
    UPDATE credits
    SET balance = balance + p_amount
    WHERE id = v_credits_id;
  END IF;

  -- Record transaction
  INSERT INTO credit_transactions (
    syndicator_id,
    amount,
    type,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'purchase',
    p_description
  );
END;
$$;

-- Function to process subscription payment
CREATE OR REPLACE FUNCTION process_subscription_payment(
  p_user_id uuid,
  p_tier_id uuid,
  p_status text,
  p_interval text,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_cancel_at_period_end boolean
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_subscription_id uuid;
  v_credits_per_month integer;
BEGIN
  -- Validate input
  IF p_status NOT IN ('active', 'canceled', 'past_due') THEN
    RAISE EXCEPTION 'Invalid subscription status';
  END IF;

  IF p_interval NOT IN ('monthly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing interval';
  END IF;

  -- Get credits per month from tier
  SELECT credits_per_month INTO v_credits_per_month
  FROM subscription_tiers
  WHERE id = p_tier_id;

  -- Update or create subscription
  SELECT id INTO v_subscription_id
  FROM subscriptions
  WHERE syndicator_id = p_user_id;

  IF v_subscription_id IS NULL THEN
    INSERT INTO subscriptions (
      syndicator_id,
      tier_id,
      status,
      billing_interval,
      current_period_start,
      current_period_end,
      cancel_at_period_end
    ) VALUES (
      p_user_id,
      p_tier_id,
      p_status,
      p_interval,
      p_period_start,
      p_period_end,
      p_cancel_at_period_end
    )
    RETURNING id INTO v_subscription_id;
  ELSE
    UPDATE subscriptions
    SET
      tier_id = p_tier_id,
      status = p_status,
      billing_interval = p_interval,
      current_period_start = p_period_start,
      current_period_end = p_period_end,
      cancel_at_period_end = p_cancel_at_period_end,
      updated_at = now()
    WHERE id = v_subscription_id;
  END IF;

  -- If subscription is active, add credits
  IF p_status = 'active' THEN
    -- Get or create credits record
    PERFORM add_credits(
      p_user_id,
      v_credits_per_month,
      'Monthly subscription credits'
    );
  END IF;
END;
$$;
