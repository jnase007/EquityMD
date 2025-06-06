import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Please check your .env file:');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDummyDeals() {
  console.log('🚀 Starting cleanup of dummy deals...');
  
  try {
    // Get the IDs of the legitimate syndicators
    const { data: legitSyndicators, error: fetchError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name')
      .in('company_name', ['Back Bay Capital', 'Sutera Properties', 'Starboard Realty']);

    if (fetchError) {
      console.error('❌ Error fetching legitimate syndicators:', fetchError);
      return;
    }

    if (!legitSyndicators || legitSyndicators.length === 0) {
      console.log('❌ No legitimate syndicators found');
      return;
    }

    console.log(`✅ Found ${legitSyndicators.length} legitimate syndicators:`);
    legitSyndicators.forEach(syndicator => {
      console.log(`  - ${syndicator.company_name} (ID: ${syndicator.id})`);
    });

    const legitIds = legitSyndicators.map(syndicator => syndicator.id);

    // Get all current deals to see what we're working with
    const { data: allDeals, error: allDealsError } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        syndicator_id,
        syndicator_profiles!inner (
          company_name
        )
      `);

    if (allDealsError) {
      console.error('❌ Error fetching all deals:', allDealsError);
      return;
    }

    console.log(`\n📊 Current deals breakdown:`);
    console.log(`  Total deals: ${allDeals.length}`);
    
    const legitDeals = allDeals.filter(deal => legitIds.includes(deal.syndicator_id));
    const dummyDeals = allDeals.filter(deal => !legitIds.includes(deal.syndicator_id));
    
    console.log(`  Legitimate deals: ${legitDeals.length}`);
    console.log(`  Dummy deals to remove: ${dummyDeals.length}`);

    console.log(`\n✅ Legitimate deals that will be kept:`);
    legitDeals.forEach(deal => {
      console.log(`  - "${deal.title}" (${deal.syndicator_profiles.company_name})`);
    });

    console.log(`\n🗑️  Dummy deals that will be removed:`);
    dummyDeals.forEach(deal => {
      console.log(`  - "${deal.title}" (${deal.syndicator_profiles.company_name})`);
    });

    if (dummyDeals.length === 0) {
      console.log('\n✅ No dummy deals found to remove!');
      return;
    }

    // Delete all deals that are NOT from legitimate syndicators
    console.log(`\n🗑️  Removing ${dummyDeals.length} dummy deals...`);
    const dummyDealIds = dummyDeals.map(deal => deal.id);
    
    const { error: deleteError } = await supabase
      .from('deals')
      .delete()
      .in('id', dummyDealIds);

    if (deleteError) {
      console.error('❌ Error removing dummy deals:', deleteError);
      return;
    }

    console.log('✅ Dummy deals removed successfully!');

    // Verify the cleanup
    const { data: remainingDeals, error: verifyError } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        syndicator_profiles!inner (
          company_name
        )
      `);

    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError);
      return;
    }

    console.log(`\n🎉 Cleanup completed successfully!`);
    console.log(`📋 Final results:`);
    console.log(`  Total deals remaining: ${remainingDeals.length}`);
    console.log(`  Deals by syndicator:`);
    
    const dealsBySyndicator = remainingDeals.reduce((acc, deal) => {
      const company = deal.syndicator_profiles.company_name;
      if (!acc[company]) acc[company] = [];
      acc[company].push(deal.title);
      return acc;
    }, {});

    Object.entries(dealsBySyndicator).forEach(([company, deals]) => {
      console.log(`    ${company}: ${deals.length} deals`);
      deals.forEach(title => console.log(`      - ${title}`));
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the cleanup script
cleanupDummyDeals(); 