import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function check() {
  // Check if brandastic syndicator exists
  const { data: syndicators, error } = await supabase
    .from('syndicators')
    .select('*')
    .ilike('company_name', '%brandastic%');
  
  console.log('Syndicators matching "brandastic":', syndicators);
  
  // Also check for any syndicators with the slug issue
  const { data: recentSyndicators } = await supabase
    .from('syndicators')
    .select('id, company_name, slug, claimed_by, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('\nRecent syndicators:', recentSyndicators);
}

check();
