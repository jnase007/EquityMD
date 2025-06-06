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

async function addClarionSimple() {
  try {
    console.log('🚀 Adding Clarion Partners...');

    // Check existing syndicators and their structure
    const { data: existingSyndicators, error: fetchError } = await supabase
      .from('syndicator_profiles')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching existing syndicators:', fetchError);
      return;
    }

    if (existingSyndicators.length > 0) {
      console.log('📋 Table structure from existing syndicator:');
      const fields = Object.keys(existingSyndicators[0]);
      console.log('Available fields:', fields);
    }

    // Check if Clarion Partners already exists
    const { data: existingClarion } = await supabase
      .from('syndicator_profiles')
      .select('company_name')
      .eq('company_name', 'Clarion Partners')
      .maybeSingle();

    if (existingClarion) {
      console.log('✅ Clarion Partners already exists in the database');
      return;
    }

    // Try to match the pattern from Summit Capital Partners (which exists)
    console.log('📝 Attempting to add Clarion Partners with same pattern as existing syndicators...');
    
    const { data: newSyndicator, error: insertError } = await supabase
      .from('syndicator_profiles')
      .insert({
        company_name: 'Clarion Partners',
        company_description: 'Clarion Partners is a leading global real estate investment company with over 40 years of experience, managing $73.1 billion in assets under management.',
        state: 'New York',
        city: 'New York',
        years_in_business: 40,
        total_deal_volume: 73100000000,
        website_url: 'https://www.clarionpartners.com/',
        company_logo_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/syndicatorlogos//clarionpartners.png'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error adding Clarion Partners:', insertError);
      
      // Try with even less fields, matching exactly what Summit Capital has
      console.log('⚡ Trying with absolute minimal fields...');
      const { data: minimalResult, error: minimalError } = await supabase
        .from('syndicator_profiles')
        .insert({
          company_name: 'Clarion Partners',
          company_description: 'Clarion Partners - leading real estate investment firm',
          state: 'New York',
          city: 'New York'
        })
        .select()
        .single();

      if (minimalError) {
        console.error('❌ Final attempt failed:', minimalError);
        console.log('\n🔧 Debugging info:');
        console.log('This might be due to:');
        console.log('1. Row Level Security policies');
        console.log('2. Required fields not being provided'); 
        console.log('3. Foreign key constraints');
        console.log('\nTry manually adding via Supabase dashboard or contact admin.');
        return;
      }

      console.log('✅ Minimal Clarion Partners profile created!');
      console.log('📊 ID:', minimalResult.id);
      return;
    }

    console.log('✅ Clarion Partners added successfully!');
    console.log('📊 Details:');
    console.log(`   - Company: ${newSyndicator.company_name}`);
    console.log(`   - Location: ${newSyndicator.city}, ${newSyndicator.state}`);
    console.log(`   - AUM: $73.1 billion`);
    console.log(`   - ID: ${newSyndicator.id}`);
    console.log('\n🎉 Clarion Partners should now appear in the directory!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addClarionSimple(); 