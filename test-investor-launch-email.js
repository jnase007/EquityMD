import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendInvestorLaunchEmail() {
  try {
    console.log('🚀 Sending Investor Launch Email to Justin...');

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'justin@brandastic.com',
        type: 'investor_launch',
        data: {
          firstName: 'Justin'
        }
      }
    });

    if (error) {
      console.error('❌ Error response:', error);
      throw error;
    }

    console.log('✅ Email sent successfully:', data);
    console.log('📧 Check justin@brandastic.com for the personalized email!');
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Run the test
sendInvestorLaunchEmail(); 