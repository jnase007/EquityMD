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

async function fixSyndicatorLogos() {
  try {
    console.log('Updating syndicator logos with direct approach...');

    // Update Sutera Properties logo
    console.log('Updating Sutera Properties...');
    const { data: suteraData, error: suteraError, count: suteraCount } = await supabase
      .from('syndicator_profiles')
      .update({ 
        company_logo_url: '/storage/v1/object/public/syndicatorlogos/sutera.png',
        updated_at: new Date().toISOString()
      })
      .eq('company_name', 'Sutera Properties')
      .select();

    if (suteraError) {
      console.error('Error updating Sutera Properties logo:', suteraError);
      console.error('Error details:', JSON.stringify(suteraError, null, 2));
    } else {
      console.log('✓ Sutera Properties update response:', suteraData);
      console.log(`✓ Updated ${suteraData?.length || 0} records for Sutera Properties`);
    }

    // Update Back Bay Capital logo
    console.log('Updating Back Bay Capital...');
    const { data: backbayData, error: backbayError, count: backbayCount } = await supabase
      .from('syndicator_profiles')
      .update({ 
        company_logo_url: '/storage/v1/object/public/syndicatorlogos/backbay.png',
        updated_at: new Date().toISOString()
      })
      .eq('company_name', 'Back Bay Capital')
      .select();

    if (backbayError) {
      console.error('Error updating Back Bay Capital logo:', backbayError);
      console.error('Error details:', JSON.stringify(backbayError, null, 2));
    } else {
      console.log('✓ Back Bay Capital update response:', backbayData);
      console.log(`✓ Updated ${backbayData?.length || 0} records for Back Bay Capital`);
    }

    // Wait a moment then verify the updates
    console.log('\nWaiting 2 seconds then verifying updates...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: verification, error: verifyError } = await supabase
      .from('syndicator_profiles')
      .select('company_name, company_logo_url, updated_at')
      .in('company_name', ['Sutera Properties', 'Back Bay Capital']);

    if (verifyError) {
      console.error('Error verifying updates:', verifyError);
    } else {
      console.log('\nVerification results:');
      verification.forEach(s => {
        console.log(`${s.company_name}:`);
        console.log(`  Logo URL: ${s.company_logo_url || 'NULL'}`);
        console.log(`  Updated: ${s.updated_at}`);
        console.log('');
      });
    }

    console.log('Script completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

fixSyndicatorLogos(); 