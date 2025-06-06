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

async function verifyCurrentDeals() {
  console.log('🔍 Checking current deals in database...');
  
  try {
    // Get all current deals
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
      console.error('❌ Error fetching deals:', allDealsError);
      return;
    }

    console.log(`📊 Current database state:`);
    console.log(`  Total deals: ${allDeals.length}`);
    
    // Group deals by syndicator
    const dealsBySyndicator = allDeals.reduce((acc, deal) => {
      const company = deal.syndicator_profiles.company_name;
      if (!acc[company]) acc[company] = [];
      acc[company].push(deal.title);
      return acc;
    }, {});

    console.log(`\n📋 Deals by syndicator:`);
    Object.entries(dealsBySyndicator).forEach(([company, deals]) => {
      console.log(`  ${company}: ${deals.length} deals`);
      deals.forEach(title => console.log(`    - ${title}`));
    });

    // Check if we have only the target companies
    const targetCompanies = ['Back Bay Capital', 'Sutera Properties', 'Starboard Realty'];
    const currentCompanies = Object.keys(dealsBySyndicator);
    const legitCompanies = currentCompanies.filter(company => targetCompanies.includes(company));
    const dummyCompanies = currentCompanies.filter(company => !targetCompanies.includes(company));

    console.log(`\n🎯 Target analysis:`);
    console.log(`  Legitimate companies with deals: ${legitCompanies.length}`);
    console.log(`  Companies that should be removed: ${dummyCompanies.length}`);
    
    if (dummyCompanies.length > 0) {
      console.log(`  ⚠️  Still need to remove deals from: ${dummyCompanies.join(', ')}`);
    } else {
      console.log(`  ✅ Perfect! Only legitimate companies have deals.`);
    }

    const totalLegitDeals = legitCompanies.reduce((count, company) => {
      return count + dealsBySyndicator[company].length;
    }, 0);

    console.log(`\n📈 Summary:`);
    console.log(`  Legitimate deals: ${totalLegitDeals}`);
    console.log(`  Total deals: ${allDeals.length}`);
    
    if (allDeals.length === totalLegitDeals && allDeals.length <= 5) {
      console.log(`  🎉 Perfect! Database cleanup is complete.`);
    } else if (allDeals.length > 5) {
      console.log(`  ⚠️  Still need cleanup - target is 5 or fewer deals total.`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the verification script
verifyCurrentDeals(); 