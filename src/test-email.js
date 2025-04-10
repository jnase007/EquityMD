import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://frtxsynlvwhpnzzgfgbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydHhzeW5sdndocG56emdmZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzM5NDAsImV4cCI6MjA1NzEwOTk0MH0.dQa_uTFztE4XxC9owtszePY-hcMLF9rVJfL01wrHYjg';

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