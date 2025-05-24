import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl)
  console.error('SERVICE_KEY:', !!supabaseServiceKey)
  console.log('\nPlease check your .env file and make sure you have:')
  console.log('VITE_SUPABASE_URL=your_supabase_url')
  console.log('VITE_SUPABASE_SERVICE_KEY=your_service_key (or SUPABASE_SERVICE_KEY)')
  process.exit(1)
}

// Create client with service key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addBackBayDealsWithServiceKey() {
  try {
    console.log('🔍 Looking for Back Bay Capital syndicator...')
    
    // First, get Back Bay Capital syndicator ID
    const { data: syndicators, error: syndicatorError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name')
      .ilike('company_name', '%Back Bay%')

    if (syndicatorError) {
      console.error('❌ Error fetching syndicators:', syndicatorError)
      return
    }

    if (!syndicators || syndicators.length === 0) {
      console.error('❌ Back Bay Capital syndicator not found')
      // List available syndicators
      const { data: allSyndicators } = await supabase
        .from('syndicator_profiles')
        .select('company_name')
      console.log('Available syndicators:', allSyndicators?.map(s => s.company_name))
      return
    }

    const backbaySyndicator = syndicators[0]
    console.log('✅ Found syndicator:', backbaySyndicator.company_name, 'ID:', backbaySyndicator.id)

    // Delete existing BackBay deals to avoid duplicates
    console.log('🧹 Cleaning up existing BackBay deals...')
    const { error: deleteError } = await supabase
      .from('deals')
      .delete()
      .eq('syndicator_id', backbaySyndicator.id)

    if (deleteError) {
      console.error('❌ Error deleting existing deals:', deleteError)
    } else {
      console.log('✅ Cleaned up existing deals')
    }

    // Define the deals to add
    const dealsToAdd = [
      {
        syndicator_id: backbaySyndicator.id,
        title: 'San Diego Multi-Family Offering',
        description: 'Back Bay Investment Group presents an opportunity to invest in a fund focused on multifamily development and value-add projects in Southern California. Leveraging the region\'s robust economy, diverse job market, and housing demand, the fund aims to capitalize on the region\'s housing shortage while delivering superior risk-adjusted returns. High demand for housing, coupled with complex entitlement processes and limited land availability, creates a compelling investment environment. By targeting strategic locations, accessing our network of off-market deals and partnering with experienced operators, the fund seeks to maximize returns for investors.',
        property_type: 'Multi-Family',
        location: 'San Diego, CA',
        address: { street: '', city: 'San Diego', state: 'CA', zip: '' },
        investment_highlights: [
          'Access to Institutional Grade Assets',
          'Prime Residential Markets',
          'Tax Deductions & Bonus Depreciation Benefits',
          'Target 75% Cash on Cash',
          '15% Target Investor IRR',
          '1.75x Target Equity Multiple'
        ],
        minimum_investment: 500000,
        target_irr: 15,
        investment_term: 5,
        total_equity: 10000000,
        status: 'active',
        featured: true,
        cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_SanDeigo.jpg',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
      },
      {
        syndicator_id: backbaySyndicator.id,
        title: 'Newport Beach Residential Offering',
        description: 'Back Bay Investment Group is offering an exclusive opportunity to invest in residential real estate in Newport Beach and surrounding coastal communities, targeting high-demand neighborhoods with limited inventory and strong growth potential. The strategy focuses on acquiring undervalued properties and enhancing them through thoughtful renovations or redevelopment to create significant value in a relatively short time frame. Investors benefit from a preferred return structure, profit participation, and multiple exit strategies designed to optimize returns and preserve capital. With a proven track record, experienced leadership, and deep local market expertise, Back Bay is well-positioned to deliver strong, risk-adjusted returns through disciplined execution and strategic market timing.',
        property_type: 'Residential',
        location: 'Newport Beach, CA',
        address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
        investment_highlights: [
          'Short Term Investment',
          'Value-Add Strategy',
          'Multiple Exit Options',
          'Target 60% Cash on Cash',
          '20% Target Investor IRR',
          '1.6x Target Equity Multiple'
        ],
        minimum_investment: 250000,
        target_irr: 20,
        investment_term: 2,
        total_equity: 10000000,
        status: 'active',
        featured: true,
        cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
      },
      {
        syndicator_id: backbaySyndicator.id,
        title: 'Orange County Pref Equity Offering',
        description: 'Back Bay Investment Group is offering a preferred equity investment with a fixed 15% annual return, paid quarterly, and a targeted holding period of 1–3 years. Designed for investors seeking secure, predictable income, this offering provides priority in the capital stack above common equity, ensuring both regular distributions and a clear path to principal repayment. Funds are deployed into value-add residential projects in high-demand areas like Newport Beach, CA, where housing supply is limited and demand is strong. Back Bay leverages a track record of 40+ successful real estate deals, $30M+ equity raised, and zero investor losses, supported by a disciplined acquisition strategy, hands-on renovations, and multiple exit strategies for enhanced capital protection and returns.',
        property_type: 'Preferred Equity',
        location: 'Newport Beach, CA',
        address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
        investment_highlights: [
          'Quarterly Payments',
          'Fixed 15% Return',
          'Priority in the Equity Stack',
          'Target 45% Cash on Cash',
          '15% Target Investor IRR',
          '1.45x Target Equity Multiple'
        ],
        minimum_investment: 100000,
        target_irr: 15,
        investment_term: 2,
        total_equity: 10000000,
        status: 'active',
        featured: true,
        cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_OrangeCounty.jpg',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
      }
    ]

    console.log('📝 Adding deals to database using service key...')
    
    // Insert all deals at once
    const { data, error } = await supabase
      .from('deals')
      .insert(dealsToAdd)
      .select()

    if (error) {
      console.error('❌ Error adding deals:', error)
      return
    }

    console.log('🎉 BackBay deals have been added to the database!')
    console.log(`✅ Successfully added ${data.length} deals`)
    
    // Verify the deals were added
    const { data: verifyDeals, error: verifyError } = await supabase
      .from('deals')
      .select('title, property_type, target_irr, minimum_investment, slug')
      .eq('syndicator_id', backbaySyndicator.id)
      .order('created_at', { ascending: false })

    if (!verifyError && verifyDeals) {
      console.log('\n📊 Verification - BackBay deals in database:')
      verifyDeals.forEach(deal => {
        console.log(`  • ${deal.title} (${deal.property_type}) - ${deal.target_irr}% IRR, $${deal.minimum_investment.toLocaleString()} min - Slug: ${deal.slug}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
addBackBayDealsWithServiceKey() 