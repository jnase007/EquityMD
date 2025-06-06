import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runClarionMigration() {
  try {
    console.log('🚀 Running Clarion Partners migration...');

    // First, let's see what's in the table currently
    console.log('🔍 Checking existing syndicators...');
    const { data: allSyndicators, error: fetchError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name, state, city')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching existing syndicators:', fetchError);
    } else {
      console.log('📋 Current syndicators in database:');
      allSyndicators.forEach(s => {
        console.log(`   - ${s.company_name} (${s.city}, ${s.state})`);
      });
    }

    // Check if Clarion Partners already exists
    const { data: existingClarion, error: checkError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name')
      .eq('company_name', 'Clarion Partners')
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking for existing Clarion Partners:', checkError);
      return;
    }

    if (existingClarion) {
      console.log('⚠️  Clarion Partners already exists in database:', existingClarion.id);
      console.log('✅ Migration complete - Clarion Partners is already in the directory');
      return;
    }

    console.log('📝 Creating Clarion Partners entry...');

    // Generate UUID for Clarion Partners
    const clarionId = crypto.randomUUID();
    console.log('🆔 Generated ID for Clarion Partners:', clarionId);

    // Create syndicator profile with minimal fields
    console.log('💼 Creating syndicator profile...');
    const { data: syndicatorData, error: syndicatorError } = await supabase
      .from('syndicator_profiles')
      .insert({
        id: clarionId,
        company_name: 'Clarion Partners',
        company_description: 'Clarion Partners is a leading global real estate investment company with over 40 years of experience, managing $73.1 billion in assets under management. We combine our broad scale and execution capabilities with our deep market and property expertise to identify and leverage the true drivers of long-term value in real estate.',
        company_logo_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/syndicatorlogos//clarionpartners.png',
        years_in_business: 40,
        total_deal_volume: 73100000000, // $73.1 billion in AUM
        state: 'New York',
        city: 'New York',
        website_url: 'https://www.clarionpartners.com/',
        verification_status: 'verified',
        claimable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (syndicatorError) {
      console.error('❌ Error creating syndicator profile:', syndicatorError);
      
      // Try with even fewer fields
      console.log('⚡ Trying with minimal fields...');
      const { data: minimalData, error: minimalError } = await supabase
        .from('syndicator_profiles')
        .insert({
          id: clarionId,
          company_name: 'Clarion Partners',
          company_description: 'Clarion Partners is a leading global real estate investment company with over 40 years of experience, managing $73.1 billion in assets under management.',
          years_in_business: 40,
          total_deal_volume: 73100000000,
          state: 'New York',
          city: 'New York',
          website_url: 'https://www.clarionpartners.com/'
        })
        .select()
        .single();

      if (minimalError) {
        console.error('❌ Error creating minimal syndicator profile:', minimalError);
        return;
      }

      console.log('✅ Minimal syndicator profile created:', minimalData.id);
      
      console.log('\n🎉 Clarion Partners migration completed successfully (minimal)!');
      console.log('📊 Summary:');
      console.log(`   - Company: ${minimalData.company_name}`);
      console.log(`   - AUM: $73.1 billion`);
      console.log(`   - Years in Business: 40+`);
      console.log(`   - Location: New York, NY`);
      console.log(`   - ID: ${minimalData.id}`);
      
      return;
    }

    console.log('✅ Syndicator profile created:', syndicatorData.id);

    console.log('\n🎉 Clarion Partners migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Company: ${syndicatorData.company_name}`);
    console.log(`   - CEO: David Gilbert`);
    console.log(`   - Email: info@clarionpartners.com`);
    console.log(`   - AUM: $73.1 billion`);
    console.log(`   - Years in Business: 40+`);
    console.log(`   - Location: New York, NY`);
    console.log(`   - Status: Verified`);
    console.log(`   - ID: ${syndicatorData.id}`);

    console.log('\n✅ Clarion Partners should now appear in the directory at equitymd.com/directory');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
runClarionMigration(); 