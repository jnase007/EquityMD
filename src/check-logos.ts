import { supabase } from './lib/supabase';

async function checkLogos() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('logo_black, logo_white')
      .single();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Black Logo URL:', data.logo_black);
    console.log('White Logo URL:', data.logo_white);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLogos();