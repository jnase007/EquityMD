/*
  # Add Deal Reference Columns to Messages

  1. Changes
    - Add deal_id column to reference deals table
    - Add deal_title column to store deal title at time of message
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS deal_title text;