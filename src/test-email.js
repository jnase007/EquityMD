import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendTestEmail() {
  try {
    console.log('Sending test email...');

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'test@example.com', // Replace with your email for testing
        subject: 'Test Email from EquityMD',
        content: 
          'This is a test email to verify the email sending functionality.\n\n' +
          'If you receive this, the Edge Function is working correctly!',
        type: 'test',
      }
    });

    if (error) {
      console.error('Error response:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Run the test
sendTestEmail()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err));