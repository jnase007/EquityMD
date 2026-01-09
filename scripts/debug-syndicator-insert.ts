import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function debugInsert() {
  console.log('Testing syndicator insert...\n');

  // Get a real user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1)
    .single();

  if (!profile) {
    console.log('No profiles found');
    return;
  }

  console.log('Using user:', profile.email);

  // Check syndicators table structure
  const { data: columns, error: colError } = await supabase
    .rpc('get_table_columns', { table_name: 'syndicators' });
  
  if (colError) {
    console.log('Could not get columns via RPC, trying direct insert test...\n');
  }

  // Try a minimal insert
  const testData = {
    company_name: 'TEST-COMPANY-DELETE-ME-' + Date.now(),
    claimed_by: profile.id,
    claimed_at: new Date().toISOString(),
    claimable: false,
    verification_status: 'unverified',
  };

  console.log('Attempting insert with:', testData);

  const { data, error } = await supabase
    .from('syndicators')
    .insert([testData])
    .select()
    .single();

  if (error) {
    console.log('\n❌ INSERT FAILED:');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
    console.log('Error hint:', error.hint);
  } else {
    console.log('\n✅ INSERT SUCCEEDED:');
    console.log('Created syndicator:', data.company_name, 'with ID:', data.id);
    
    // Clean up
    await supabase.from('syndicators').delete().eq('id', data.id);
    console.log('Test record deleted.');
  }
}

debugInsert();
