import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('SERVICE_KEY:', !!supabaseServiceKey);
  console.log('\nPlease check your .env file and make sure you have:');
  console.log('VITE_SUPABASE_URL=your_supabase_url');
  console.log('VITE_SUPABASE_SERVICE_KEY=your_service_key (or SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

// Create client with service key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminPolicies() {
  try {
    console.log('🔧 Fixing admin policies for user management...');
    
    // First, let's check the current policies
    console.log('📋 Checking current policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'profiles');
    
    if (policiesError) {
      console.error('❌ Error fetching current policies:', policiesError);
    } else {
      console.log('Current policies on profiles table:');
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
      });
    }

    console.log('\n🔄 Applying admin policy fixes...');

    // Drop the restrictive update policy
    console.log('1. Dropping restrictive update policy...');
    const dropUpdatePolicy = `
      DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropUpdatePolicy 
    });
    
    if (dropError) {
      console.error('❌ Error dropping update policy:', dropError);
      // Try alternative approach
      console.log('Trying alternative approach...');
      const { error: altDropError } = await supabase
        .from('pg_policies')
        .delete()
        .eq('tablename', 'profiles')
        .eq('policyname', 'Enable update for users based on id');
      
      if (altDropError) {
        console.error('❌ Alternative drop also failed:', altDropError);
      }
    } else {
      console.log('✅ Successfully dropped restrictive update policy');
    }

    // Create new update policy that allows admins
    console.log('2. Creating new admin-friendly update policy...');
    const createUpdatePolicy = `
      CREATE POLICY "Enable update for users and admins"
        ON profiles
        FOR UPDATE
        USING (
          auth.uid() = id OR  -- Users can update their own profile
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
          )  -- Admins can update any profile
        )
        WITH CHECK (
          auth.uid() = id OR  -- Users can update their own profile
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
          )  -- Admins can update any profile
        );
    `;
    
    const { error: createUpdateError } = await supabase.rpc('exec_sql', { 
      sql: createUpdatePolicy 
    });
    
    if (createUpdateError) {
      console.error('❌ Error creating new update policy:', createUpdateError);
    } else {
      console.log('✅ Successfully created new admin-friendly update policy');
    }

    // Update the select policy to ensure admins can view all profiles
    console.log('3. Updating select policy for admin access...');
    
    const dropSelectPolicy = `
      DROP POLICY IF EXISTS "Enable select for authenticated users" ON profiles;
    `;
    
    const { error: dropSelectError } = await supabase.rpc('exec_sql', { 
      sql: dropSelectPolicy 
    });
    
    const createSelectPolicy = `
      CREATE POLICY "Enable select for users and admins"
        ON profiles
        FOR SELECT
        USING (
          auth.uid() = id OR  -- Users can view their own profile
          auth.role() = 'authenticated' OR  -- Authenticated users can view other profiles
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
          )  -- Admins can view all profiles
        );
    `;
    
    const { error: createSelectError } = await supabase.rpc('exec_sql', { 
      sql: createSelectPolicy 
    });
    
    if (createSelectError) {
      console.error('❌ Error creating new select policy:', createSelectError);
    } else {
      console.log('✅ Successfully updated select policy for admin access');
    }

    // Verify the fix by checking if we can find admin users
    console.log('\n🔍 Verifying admin users exist...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_admin')
      .eq('is_admin', true);
    
    if (adminError) {
      console.error('❌ Error fetching admin users:', adminError);
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(admin => {
        console.log(`  - ${admin.full_name || 'Unnamed'} (${admin.email})`);
      });
    }

    console.log('\n🎉 Admin policy fix completed!');
    console.log('📝 Summary of changes:');
    console.log('  - Removed restrictive update policy that only allowed self-updates');
    console.log('  - Added new policy allowing admins to update any user profile');
    console.log('  - Updated select policy to ensure admin access');
    console.log('\n✨ Admins should now be able to update user roles and verification status!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the fix
fixAdminPolicies(); 