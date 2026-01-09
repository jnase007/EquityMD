import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkPolicies() {
  // Direct SQL query to check RLS policies
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies 
      WHERE tablename = 'syndicators';
    `
  });
  
  if (error) {
    console.log('RPC not available, using raw query approach...');
    
    // Check if RLS is enabled
    const { data: tables } = await supabase.rpc('exec_sql', {
      sql: `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'syndicators';`
    });
    console.log('Table RLS status:', tables);
  } else {
    console.log('RLS Policies on syndicators:', JSON.stringify(data, null, 2));
  }
}

checkPolicies();
