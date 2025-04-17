-- Add columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS deal_title text;
