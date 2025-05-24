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

async function debugSyndicators() {
  try {
    console.log('Fetching all syndicator profiles...');

    const { data: syndicators, error } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name, company_logo_url, slug');

    if (error) {
      console.error('Error fetching syndicators:', error);
      return;
    }

    console.log(`Found ${syndicators.length} syndicator profiles:`);
    syndicators.forEach((s, index) => {
      console.log(`${index + 1}. ID: ${s.id}`);
      console.log(`   Company: "${s.company_name}"`);
      console.log(`   Slug: "${s.slug}"`);
      console.log(`   Logo URL: ${s.company_logo_url || 'NULL'}`);
      console.log('');
    });

    // Check if Sutera Properties exists with variations
    const suteraVariations = [
      'Sutera Properties',
      'sutera properties',
      'Sutera Properties LLC',
      'sutera-properties'
    ];

    console.log('Checking for Sutera Properties variations...');
    for (const variation of suteraVariations) {
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .select('company_name, company_logo_url')
        .ilike('company_name', variation);

      if (data && data.length > 0) {
        console.log(`Found match for "${variation}":`, data);
      }
    }

    // Check for Back Bay Capital variations
    const backbayVariations = [
      'Back Bay Capital',
      'back bay capital',
      'BackBay Capital',
      'Back Bay Capital LLC'
    ];

    console.log('Checking for Back Bay Capital variations...');
    for (const variation of backbayVariations) {
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .select('company_name, company_logo_url')
        .ilike('company_name', variation);

      if (data && data.length > 0) {
        console.log(`Found match for "${variation}":`, data);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugSyndicators(); 