import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function fixRLS() {
  console.log('Checking and fixing RLS policies on syndicators table...\n');

  // First, let's check if we can insert with a real user ID
  // Get a sample user ID from profiles
  const { data: sampleProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1)
    .single();

  if (sampleProfile) {
    console.log('Testing with user:', sampleProfile.email);
    
    // Try to create the INSERT policy via SQL
    const policySql = `
      -- Drop existing insert policy if exists
      DROP POLICY IF EXISTS "Users can create syndicators" ON syndicators;
      
      -- Create new insert policy for authenticated users
      CREATE POLICY "Users can create syndicators" ON syndicators
        FOR INSERT
        TO authenticated
        WITH CHECK (claimed_by = auth.uid());
      
      -- Also ensure update policy exists
      DROP POLICY IF EXISTS "Users can update own syndicators" ON syndicators;
      CREATE POLICY "Users can update own syndicators" ON syndicators
        FOR UPDATE
        TO authenticated
        USING (claimed_by = auth.uid())
        WITH CHECK (claimed_by = auth.uid());
    `;
    
    console.log('\nSQL to run in Supabase SQL Editor:');
    console.log('================================');
    console.log(policySql);
    console.log('================================\n');
  }
}

fixRLS();
