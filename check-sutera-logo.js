import { createClient } from '@supabase/supabase-js';

// Use the known Supabase credentials from the production build
const supabaseUrl = 'https://frtxsynlvwhpnzzgfgbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydHhzeW5sdndocG56emdmZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzM5NDAsImV4cCI6MjA1NzEwOTk0MH0.dQa_uTFztE4XxC9owtszePY-hcMLF9rVJfL01wrHYjg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSuteraLogo() {
  try {
    console.log('Checking current Sutera Properties logo...');

    // Check all syndicator profiles
    const { data: allSyndicators, error: allError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name, company_logo_url')
      .ilike('company_name', '%Sutera%');

    if (allError) {
      console.error('Error fetching syndicators:', allError);
      return;
    }

    console.log(`Found ${allSyndicators.length} syndicator profiles with "Sutera" in the name:`);
    allSyndicators.forEach((s, index) => {
      console.log(`${index + 1}. ID: ${s.id}`);
      console.log(`   Company: "${s.company_name}"`);
      console.log(`   Current Logo: ${s.company_logo_url || 'NULL'}`);
      console.log('');
    });

    // Try to update the exact match
    if (allSyndicators.length > 0) {
      const sutera = allSyndicators[0];
      console.log(`Updating logo for "${sutera.company_name}" (ID: ${sutera.id})...`);
      
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .update({ 
          company_logo_url: '/storage/v1/object/public/syndicatorlogos/sutera.png',
          updated_at: new Date().toISOString()
        })
        .eq('id', sutera.id)
        .select();

      if (error) {
        console.error('Error updating logo:', error);
      } else {
        console.log('✓ Logo updated successfully!');
        console.log(`✓ Updated ${data?.length || 0} records`);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSuteraLogo();
