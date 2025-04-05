import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://frtxsynlvwhpnzzgfgbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydHhzeW5sdndocG56emdmZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzM5NDAsImV4cCI6MjA1NzEwOTk0MH0.dQa_uTFztE4XxC9owtszePY-hcMLF9rVJfL01wrHYjg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendTestDealNotification() {
  try {
    // First check if the Edge Function exists
    console.log('Sending test notification...');

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: JSON.stringify({
        to: 'justin@brandastic.com',
        subject: 'New Investment Opportunity from Summit Capital Partners',
        content: 
          'Property: The Metropolitan\n' +
          'Location: Austin, TX\n' +
          'Type: Multi-Family\n' +
          'Minimum Investment: $50,000\n' +
          'Target IRR: 18%\n' +
          'Investment Term: 5 years',
        type: 'deal_update',
        data: {
          deal_id: '123',
          deal_slug: 'the-metropolitan'
        }
      })
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

// Execute the test
sendTestDealNotification()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err));