-- Add verification status management fields to syndicator_profiles
ALTER TABLE syndicator_profiles 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'featured', 'premium')),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification status queries
CREATE INDEX IF NOT EXISTS idx_syndicator_profiles_verification_status ON syndicator_profiles(verification_status);

-- Create verification history table for audit trail
CREATE TABLE IF NOT EXISTS syndicator_verification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    syndicator_id UUID REFERENCES syndicator_profiles(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on verification history
ALTER TABLE syndicator_verification_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view verification history
CREATE POLICY "Admins can view verification history"
    ON syndicator_verification_history
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Only admins can insert verification history
CREATE POLICY "Admins can insert verification history"
    ON syndicator_verification_history
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Create trigger to automatically log verification status changes
CREATE OR REPLACE FUNCTION log_verification_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if verification_status actually changed
    IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
        INSERT INTO syndicator_verification_history (
            syndicator_id,
            previous_status,
            new_status,
            changed_by,
            admin_notes
        ) VALUES (
            NEW.id,
            OLD.verification_status,
            NEW.verification_status,
            auth.uid(),
            NEW.verification_notes
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS syndicator_verification_status_change ON syndicator_profiles;
CREATE TRIGGER syndicator_verification_status_change
    AFTER UPDATE ON syndicator_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_verification_status_change();

-- Update existing syndicator profiles with appropriate verification status
-- Set premium status for specific high-tier syndicators
UPDATE syndicator_profiles 
SET verification_status = 'premium',
    verified_at = NOW()
WHERE company_name IN ('Back Bay Capital', 'Sutera Properties');

-- Set featured status for notable syndicators
UPDATE syndicator_profiles 
SET verification_status = 'featured',
    verified_at = NOW()
WHERE company_name IN ('Starboard Realty', 'Cardone Capital', 'Blackstone Real Estate');

-- Set verified status for all others (default)
UPDATE syndicator_profiles 
SET verification_status = 'verified',
    verified_at = NOW()
WHERE verification_status IS NULL; 