import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkSlug() {
  // Try inserting WITH a slug value to see if it fails
  const testData = {
    company_name: 'TEST-SLUG-CHECK-' + Date.now(),
    slug: 'test-slug-' + Date.now(), // Include slug
    claimed_by: null,
    claimable: true,
    verification_status: 'unverified',
  };

  console.log('Testing insert WITH explicit slug...');
  const { data, error } = await supabase
    .from('syndicators')
    .insert([testData])
    .select()
    .single();

  if (error) {
    console.log('\n❌ Insert with slug FAILED:');
    console.log('Error:', error.message);
    
    if (error.message.includes('generated') || error.message.includes('GENERATED')) {
      console.log('\n⚠️  The slug column is GENERATED - cannot insert values!');
    }
  } else {
    console.log('\n✅ Insert with slug SUCCEEDED');
    console.log('Slug column accepts manual values');
    // Clean up
    await supabase.from('syndicators').delete().eq('id', data.id);
  }
}

checkSlug();
