import { createClient } from '@supabase/supabase-js';

// Use the known Supabase credentials from the production build
const supabaseUrl = 'https://frtxsynlvwhpnzzgfgbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydHhzeW5sdndocG56emdmZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzM5NDAsImV4cCI6MjA1NzEwOTk0MH0.dQa_uTFztE4XxC9owtszePY-hcMLF9rVJfL01wrHYjg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSuteraLogo() {
  try {
    console.log('Updating Sutera Properties logo to sutera.png...');

    // Update Sutera Properties logo in the database
    const { data, error, count } = await supabase
      .from('syndicator_profiles')
      .update({ 
        company_logo_url: '/storage/v1/object/public/syndicatorlogos/sutera.png',
        updated_at: new Date().toISOString()
      })
      .eq('company_name', 'Sutera Properties')
      .select();

    if (error) {
      console.error('Error updating Sutera Properties logo:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✓ Sutera Properties logo updated successfully!');
      console.log(`✓ Updated ${data?.length || 0} records`);
      console.log('✓ New logo URL: /storage/v1/object/public/syndicatorlogos/sutera.png');
    }

    // Verify the update
    console.log('\nVerifying the update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('syndicator_profiles')
      .select('company_name, company_logo_url')
      .eq('company_name', 'Sutera Properties');

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('✓ Verification successful:');
      verifyData.forEach(s => {
        console.log(`  ${s.company_name}: ${s.company_logo_url || 'No logo set'}`);
      });
    }

    console.log('\n✅ Sutera Properties logo update completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

updateSuteraLogo();
