const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or key. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixInvestorProfilePolicies() {
  console.log('🔧 Fixing investor profile policies...');

  try {
    // Drop existing policies for investor_profiles
    console.log('1. Dropping existing policies...');
    const dropPolicies = `
      DROP POLICY IF EXISTS "Enable insert for authentication service" ON investor_profiles;
      DROP POLICY IF EXISTS "Enable select for authenticated users" ON investor_profiles;
      DROP POLICY IF EXISTS "Enable update for users based on id" ON investor_profiles;
      DROP POLICY IF EXISTS "Public can view investor profiles" ON investor_profiles;
      DROP POLICY IF EXISTS "Users can update own investor profile" ON investor_profiles;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicies });
    
    if (dropError) {
      console.error('❌ Error dropping policies:', dropError);
    } else {
      console.log('✅ Successfully dropped existing policies');
    }

    // Create comprehensive policies for investor_profiles
    console.log('2. Creating new policies...');
    const createPolicies = `
      CREATE POLICY "Enable insert for authentication service"
        ON investor_profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id);

      CREATE POLICY "Enable select for authenticated users"
        ON investor_profiles
        FOR SELECT
        USING (
          auth.uid() = id OR  -- Users can view their own profile
          auth.role() = 'authenticated'  -- Authenticated users can view other profiles
        );

      CREATE POLICY "Enable update for users based on id"
        ON investor_profiles
        FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);

      CREATE POLICY "Enable upsert for users"
        ON investor_profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id);
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPolicies });
    
    if (createError) {
      console.error('❌ Error creating policies:', createError);
    } else {
      console.log('✅ Successfully created new policies');
    }

    // Ensure RLS is enabled
    console.log('3. Enabling RLS...');
    const enableRLS = `
      ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ Successfully enabled RLS');
    }

    console.log('✅ Investor profile policies fixed successfully!');
    console.log('📝 The auto-save functionality should now work properly.');
    
  } catch (error) {
    console.error('❌ Error fixing investor profile policies:', error);
  }
}

// Run the fix
fixInvestorProfilePolicies(); 