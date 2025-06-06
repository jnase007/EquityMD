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

async function cleanupDummyDealsV2() {
  console.log('🚀 Starting cleanup of dummy deals (v2)...');
  
  try {
    // First, let's see all syndicators to understand naming
    const { data: allSyndicators, error: allSyndicatorsError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name');

    if (allSyndicatorsError) {
      console.error('❌ Error fetching all syndicators:', allSyndicatorsError);
      return;
    }

    console.log('📋 All syndicators in database:');
    allSyndicators.forEach(syndicator => {
      console.log(`  - ${syndicator.company_name} (ID: ${syndicator.id})`);
    });

    // Get the IDs of the legitimate syndicators (checking for variations)
    const legitCompanies = ['Back Bay Capital', 'Sutera Properties', 'Starboard Realty'];
    const { data: legitSyndicators, error: fetchError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name')
      .in('company_name', legitCompanies);

    if (fetchError) {
      console.error('❌ Error fetching legitimate syndicators:', fetchError);
      return;
    }

    console.log(`\n✅ Found ${legitSyndicators.length} legitimate syndicators:`);
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

    // Delete dummy deals one by one to ensure they're removed
    console.log(`\n🗑️  Removing ${dummyDeals.length} dummy deals...`);
    
    let removedCount = 0;
    for (const deal of dummyDeals) {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', deal.id);

      if (deleteError) {
        console.error(`❌ Error removing deal "${deal.title}":`, deleteError);
      } else {
        console.log(`✅ Removed: "${deal.title}" (${deal.syndicator_profiles.company_name})`);
        removedCount++;
      }
    }

    console.log(`\n✅ Successfully removed ${removedCount} out of ${dummyDeals.length} dummy deals!`);

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

    if (remainingDeals.length <= 5) {
      console.log(`\n🎯 Perfect! We now have ${remainingDeals.length} deals total (target was 5 or fewer).`);
    } else {
      console.log(`\n⚠️  We still have ${remainingDeals.length} deals. Target was 5 or fewer.`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the cleanup script
cleanupDummyDealsV2(); 