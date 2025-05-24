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

async function runMigration() {
  try {
    console.log('Updating syndicator logos...');

    // Update Sutera Properties logo
    const { error: suteraError } = await supabase
      .from('syndicator_profiles')
      .update({ company_logo_url: '/storage/v1/object/public/syndicatorlogos/sutera.png' })
      .eq('company_name', 'Sutera Properties');

    if (suteraError) {
      console.error('Error updating Sutera Properties logo:', suteraError);
    } else {
      console.log('✓ Updated Sutera Properties logo');
    }

    // Update Back Bay Capital logo
    const { error: backbayError } = await supabase
      .from('syndicator_profiles')
      .update({ company_logo_url: '/storage/v1/object/public/syndicatorlogos/backbay.png' })
      .eq('company_name', 'Back Bay Capital');

    if (backbayError) {
      console.error('Error updating Back Bay Capital logo:', backbayError);
    } else {
      console.log('✓ Updated Back Bay Capital logo');
    }

    // Verify the updates
    const { data: syndicators, error: fetchError } = await supabase
      .from('syndicator_profiles')
      .select('company_name, company_logo_url')
      .in('company_name', ['Sutera Properties', 'Back Bay Capital']);

    if (fetchError) {
      console.error('Error fetching syndicators:', fetchError);
    } else {
      console.log('\nCurrent syndicator logos:');
      syndicators.forEach(s => {
        console.log(`${s.company_name}: ${s.company_logo_url || 'No logo set'}`);
      });
    }

    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration(); 