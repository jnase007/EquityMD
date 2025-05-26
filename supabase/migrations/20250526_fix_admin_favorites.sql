-- Fix favorites table to allow admin users to use favorites feature
-- Update RLS policies to allow both investors and admins

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create new policies that allow both investors and admins
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (
        investor_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type IN ('investor', 'admin')
        )
    );

CREATE POLICY "Users can create their own favorites" ON favorites
    FOR INSERT WITH CHECK (
        investor_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type IN ('investor', 'admin')
        )
    );

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (
        investor_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type IN ('investor', 'admin')
        )
    );

-- Add comment to clarify the table usage
COMMENT ON TABLE favorites IS 'Stores favorited deals for investors and admins. investor_id field stores the user ID regardless of user type.'; 