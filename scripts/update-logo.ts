import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function updateLogo() {
  const logoUrl = 'https://auth.equitymd.com/storage/v1/object/public/syndicatorlogos/logo_510ee3ea2c48bbaa1d387237e58a6167_2x.png';
  
  const { data, error } = await supabase
    .from('syndicators')
    .update({ company_logo_url: logoUrl })
    .eq('slug', 'rise48-equity')
    .select('company_name, slug, company_logo_url');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Updated logo:');
    console.log(JSON.stringify(data, null, 2));
  }
}

updateLogo();
