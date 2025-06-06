-- Fix favorites table to work with Supabase auth users
-- Remove the problematic foreign key constraint and allow auth.uid() directly

BEGIN;

-- Drop existing foreign key constraint if it exists
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_investor_id_fkey;

-- Update the table structure to work with auth.uid() directly
-- The investor_id should reference auth.users, not profiles table
ALTER TABLE favorites ALTER COLUMN investor_id SET NOT NULL;

-- Add a comment to clarify the usage
COMMENT ON COLUMN favorites.investor_id IS 'References auth.users.id directly, not profiles table';

-- Update RLS policies to be more straightforward
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create simplified RLS policies that work with auth.uid()
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "Users can create their own favorites" ON favorites
    FOR INSERT WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (investor_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

COMMIT; 