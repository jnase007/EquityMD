import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env file:');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Create admin client to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceDeleteAllDeals() {
  console.log('🚀 Force deleting ALL deals using SQL...');
  
  try {
    // Get count of deals before deletion
    const { count: beforeCount, error: countError } = await supabase
      .from('deals')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error('❌ Error counting deals:', countError);
    } else {
      console.log(`📊 Deals before deletion: ${beforeCount}`);
    }

    // Use RPC to execute SQL directly
    console.log('🗑️  Executing SQL to delete all deals...');
    
    const { data, error } = await supabase.rpc('delete_all_deals');
    
    if (error) {
      console.error('❌ RPC method failed, trying direct SQL...');
      
      // Alternative: Use direct SQL execution
      const { data: sqlData, error: sqlError } = await supabase
        .from('deals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (sqlError) {
        console.error('❌ Direct SQL failed too:', sqlError);
        
        // Last resort: try to delete by fetching IDs first
        console.log('🔄 Trying alternative approach...');
        
        const { data: allDeals, error: fetchError } = await supabase
          .from('deals')
          .select('id');
          
        if (fetchError) {
          console.error('❌ Cannot even fetch deal IDs:', fetchError);
          return;
        }
        
        console.log(`📋 Found ${allDeals.length} deals to delete individually...`);
        
        // Delete each deal by ID
        let deleted = 0;
        for (const deal of allDeals) {
          const { error: deleteError } = await supabase
            .from('deals')
            .delete()
            .match({ id: deal.id });
            
          if (!deleteError) {
            deleted++;
            if (deleted % 5 === 0) {
              console.log(`✅ Deleted ${deleted}/${allDeals.length} deals...`);
            }
          } else {
            console.error(`❌ Failed to delete deal ${deal.id}:`, deleteError.message);
          }
        }
        
        console.log(`✅ Deleted ${deleted}/${allDeals.length} deals individually`);
        
      } else {
        console.log('✅ Direct SQL deletion succeeded');
      }
    } else {
      console.log('✅ RPC deletion succeeded');
    }

    // Verify the deletion
    const { count: afterCount, error: verifyError } = await supabase
      .from('deals')
      .select('*', { count: 'exact' });

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
    } else {
      console.log(`\n🎉 Verification complete:`);
      console.log(`  Deals before: ${beforeCount}`);
      console.log(`  Deals after: ${afterCount}`);
      
      if (afterCount === 0) {
        console.log(`  🎯 Perfect! All deals have been removed from the database.`);
        console.log(`  📄 The site now has a clean slate with no dummy deals.`);
      } else {
        console.log(`  ⚠️  ${afterCount} deals still remain. Manual intervention may be needed.`);
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the force deletion script
forceDeleteAllDeals(); 