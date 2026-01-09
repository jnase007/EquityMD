import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkRLS() {
  // Check if RLS is enabled on syndicators
  const { data: policies, error } = await supabase.rpc('get_policies', { table_name: 'syndicators' });
  
  if (error) {
    // RPC might not exist, try a direct query
    const { data, error: queryError } = await supabase
      .from('syndicators')
      .select('id, company_name, claimed_by')
      .limit(3);
    
    console.log('Syndicators sample:', data);
    if (queryError) console.error('Query error:', queryError);
  } else {
    console.log('Policies:', policies);
  }
  
  // Test insert with service key (should always work)
  console.log('\nTesting insert capability...');
  const testData = {
    company_name: 'TEST-DELETE-ME',
    claimed_by: '00000000-0000-0000-0000-000000000000',
    verification_status: 'unverified',
    claimable: false,
  };
  
  const { data: insertResult, error: insertError } = await supabase
    .from('syndicators')
    .insert([testData])
    .select()
    .single();
  
  if (insertError) {
    console.error('Insert test FAILED:', insertError);
  } else {
    console.log('Insert test PASSED');
    // Clean up
    await supabase.from('syndicators').delete().eq('id', insertResult.id);
    console.log('Test record cleaned up');
  }
}

checkRLS();
