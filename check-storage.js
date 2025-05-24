import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  try {
    console.log('Checking storage buckets...');

    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      console.log('Available buckets:');
      buckets.forEach(bucket => {
        console.log(`- ${bucket.name} (public: ${bucket.public})`);
      });
    }

    // Check syndicatorlogos bucket specifically
    console.log('\nChecking syndicatorlogos bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('syndicatorlogos')
      .list();

    if (filesError) {
      console.error('Error listing files in syndicatorlogos bucket:', filesError);
      console.log('This bucket might not exist or be accessible');
    } else {
      console.log('Files in syndicatorlogos bucket:');
      files.forEach(file => {
        console.log(`- ${file.name}`);
      });
    }

    // Test the specific URLs we're trying to use
    const testUrls = [
      `${supabaseUrl}/storage/v1/object/public/syndicatorlogos/sutera.png`,
      `${supabaseUrl}/storage/v1/object/public/syndicatorlogos/backbay.png`
    ];

    console.log('\nTesting specific logo URLs:');
    for (const url of testUrls) {
      try {
        const response = await fetch(url);
        console.log(`${url}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`${url}: Failed to fetch - ${error.message}`);
      }
    }

    // Try updating with full URLs instead
    console.log('\nTrying update with full URLs...');
    
    const { data: suteraUpdate, error: suteraError } = await supabase
      .from('syndicator_profiles')
      .update({ 
        company_logo_url: `${supabaseUrl}/storage/v1/object/public/syndicatorlogos/sutera.png`
      })
      .eq('company_name', 'Sutera Properties')
      .select();

    console.log('Sutera update result:', { data: suteraUpdate, error: suteraError });

    const { data: backbayUpdate, error: backbayError } = await supabase
      .from('syndicator_profiles')
      .update({ 
        company_logo_url: `${supabaseUrl}/storage/v1/object/public/syndicatorlogos/backbay.png`
      })
      .eq('company_name', 'Back Bay Capital')
      .select();

    console.log('Back Bay update result:', { data: backbayUpdate, error: backbayError });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkStorage(); 