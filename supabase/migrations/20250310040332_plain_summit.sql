/*
  # Add dummy messages and notifications
  
  1. Changes
    - Insert dummy messages from syndicators
    - Create corresponding notifications
*/

DO $$ 
DECLARE
  test_investor_id uuid;
  syndicator_1_id uuid;
  syndicator_2_id uuid;
  syndicator_3_id uuid;
  deal_1_id uuid;
  deal_2_id uuid;
  deal_3_id uuid;
BEGIN
  -- Get test investor ID (assuming email is test.investor@equitymd.com)
  SELECT id INTO test_investor_id FROM profiles WHERE email = 'test.investor@equitymd.com';
  
  -- Get some syndicator IDs
  SELECT id INTO syndicator_1_id FROM profiles WHERE user_type = 'syndicator' LIMIT 1;
  SELECT id INTO syndicator_2_id FROM profiles WHERE user_type = 'syndicator' AND id != syndicator_1_id LIMIT 1;
  SELECT id INTO syndicator_3_id FROM profiles WHERE user_type = 'syndicator' AND id NOT IN (syndicator_1_id, syndicator_2_id) LIMIT 1;

  -- Get some deal IDs
  SELECT id INTO deal_1_id FROM deals LIMIT 1;
  SELECT id INTO deal_2_id FROM deals WHERE id != deal_1_id LIMIT 1;
  SELECT id INTO deal_3_id FROM deals WHERE id NOT IN (deal_1_id, deal_2_id) LIMIT 1;

  -- Insert messages and notifications will be created automatically via trigger
  INSERT INTO messages (sender_id, receiver_id, deal_id, content, created_at)
  VALUES 
    (syndicator_1_id, test_investor_id, deal_1_id, 'Thank you for your interest in The Metropolitan project. Would you like to schedule a call to discuss the investment opportunity in detail?', NOW() - INTERVAL '2 hours'),
    (syndicator_2_id, test_investor_id, deal_2_id, 'We noticed you viewed our latest multi-family development. We''re having an investor webinar next week to showcase the project. Would you like to join?', NOW() - INTERVAL '1 hour'),
    (syndicator_3_id, test_investor_id, deal_3_id, 'Based on your investment preferences, I think you''d be interested in our new medical office development. The minimum investment is $50,000 with a projected IRR of 18%.', NOW() - INTERVAL '30 minutes');

END $$;