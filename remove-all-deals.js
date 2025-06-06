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

async function removeAllDeals() {
  console.log('🚀 Starting removal of ALL deals (all are dummy data)...');
  
  try {
    // First, get all current deals to see what we're removing
    const { data: allDeals, error: fetchError } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        syndicator_profiles!inner (
          company_name
        )
      `);

    if (fetchError) {
      console.error('❌ Error fetching deals:', fetchError);
      return;
    }

    console.log(`📊 Current state:`);
    console.log(`  Total deals to remove: ${allDeals.length}`);
    
    // Group deals by syndicator for reporting
    const dealsBySyndicator = allDeals.reduce((acc, deal) => {
      const company = deal.syndicator_profiles.company_name;
      if (!acc[company]) acc[company] = [];
      acc[company].push(deal.title);
      return acc;
    }, {});

    console.log(`\n📋 All deals that will be removed:`);
    Object.entries(dealsBySyndicator).forEach(([company, deals]) => {
      console.log(`  ${company}: ${deals.length} deals`);
      deals.forEach(title => console.log(`    - ${title}`));
    });

    if (allDeals.length === 0) {
      console.log('\n✅ No deals found - database is already clean!');
      return;
    }

    console.log(`\n🗑️  Removing ALL ${allDeals.length} deals...`);
    
    // Remove all deals one by one to ensure they're deleted
    let removedCount = 0;
    let failedCount = 0;
    
    for (const deal of allDeals) {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', deal.id);

      if (deleteError) {
        console.error(`❌ Failed to remove: "${deal.title}":`, deleteError.message);
        failedCount++;
      } else {
        console.log(`✅ Removed: "${deal.title}" (${deal.syndicator_profiles.company_name})`);
        removedCount++;
      }
    }

    console.log(`\n📊 Removal summary:`);
    console.log(`  Successfully removed: ${removedCount} deals`);
    console.log(`  Failed to remove: ${failedCount} deals`);

    // Verify the cleanup
    const { data: remainingDeals, error: verifyError } = await supabase
      .from('deals')
      .select('id, title');

    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError);
      return;
    }

    console.log(`\n🎉 Cleanup verification:`);
    console.log(`  Deals remaining in database: ${remainingDeals.length}`);
    
    if (remainingDeals.length === 0) {
      console.log(`  🎯 Perfect! All dummy deals have been removed.`);
      console.log(`  📄 The database now has a clean slate for real deals.`);
    } else {
      console.log(`  ⚠️  ${remainingDeals.length} deals still remain.`);
      console.log(`  Remaining deals:`);
      remainingDeals.forEach(deal => {
        console.log(`    - ${deal.title}`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the removal script
removeAllDeals(); 