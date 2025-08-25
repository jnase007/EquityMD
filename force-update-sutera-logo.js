import { createClient } from '@supabase/supabase-js';

// Use the known Supabase credentials from the production build
const supabaseUrl = 'https://frtxsynlvwhpnzzgfgbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydHhzeW5sdndocG56emdmZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzM5NDAsImV4cCI6MjA1NzEwOTk0MH0.dQa_uTFztE4XxC9owtszePY-hcMLF9rVJfL01wrHYjg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdateSuteraLogo() {
  try {
    console.log('Force updating Sutera Properties logo...');

    // First, let's see what's currently in the database
    const { data: current, error: fetchError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name, company_logo_url')
      .eq('company_name', 'Sutera Properties');

    if (fetchError) {
      console.error('Error fetching current data:', fetchError);
      return;
    }

    console.log('Current data:', current);

    if (current && current.length > 0) {
      const sutera = current[0];
      console.log(`Updating "${sutera.company_name}" (ID: ${sutera.id})`);
      console.log(`From: ${sutera.company_logo_url}`);
      console.log(`To: ${supabaseUrl}/storage/v1/object/public/syndicatorlogos/sutera.png`);

      // Update with the full URL
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .update({ 
          company_logo_url: `${supabaseUrl}/storage/v1/object/public/syndicatorlogos/sutera.png`,
          updated_at: new Date().toISOString()
        })
        .eq('id', sutera.id)
        .select();

      if (error) {
        console.error('Error updating logo:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✓ Logo updated successfully!');
        console.log('✓ Updated data:', data);
      }
    } else {
      console.log('No Sutera Properties found in database');
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

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

forceUpdateSuteraLogo();
