import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogos() {
  try {
    // First sign in as admin
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@equitymd.com',
      password: 'Admin123!'
    });

    if (signInError) {
      console.error('Error signing in:', signInError);
      process.exit(1);
    }

    // Get current site settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      process.exit(1);
    }

    if (!settings) {
      console.error('No settings found');
      process.exit(1);
    }

    // Log current logo URLs
    console.log('Current logo settings:');
    console.log('Black Logo:', settings.logo_black || 'Not set');
    console.log('White Logo:', settings.logo_white || 'Not set');

    // Update with new logo URLs
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({
        logo_black: 'https://brandastic.com/wp-content/uploads/2025/03/EquityLogo_March25_BLACK.png',
        logo_white: 'https://brandastic.com/wp-content/uploads/2025/03/EquityLogo_March25_WHITE.png',
        updated_at: new Date().toISOString(),
        updated_by: signInData.user.id
      })
      .eq('id', settings.id);

    if (updateError) {
      console.error('Error updating settings:', updateError);
      process.exit(1);
    }

    console.log('\nLogo URLs updated successfully!');
    console.log('New Black Logo URL:', 'https://brandastic.com/wp-content/uploads/2025/03/EquityLogo_March25_BLACK.png');
    console.log('New White Logo URL:', 'https://brandastic.com/wp-content/uploads/2025/03/EquityLogo_March25_WHITE.png');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the check
checkLogos()
  .then(() => {
    console.log('\nCheck completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nCheck failed:', error);
    process.exit(1);
  });