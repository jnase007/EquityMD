import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function updateLogo() {
  const logoUrl = 'https://auth.equitymd.com/storage/v1/object/public/syndicatorlogos/BAM-Capital-Blue_new-768x768.webp';
  
  const { data, error } = await supabase
    .from('syndicators')
    .update({ company_logo_url: logoUrl })
    .eq('slug', 'bam-capital')
    .select('company_name, slug, company_logo_url');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Updated BAM Capital logo:');
    console.log(JSON.stringify(data, null, 2));
  }
}

updateLogo();
