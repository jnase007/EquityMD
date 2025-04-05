import { supabase } from './lib/supabase';

async function sendTestDealNotification() {
  try {
    // Call the Edge Function directly
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
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
      }
    });

    if (error) throw error;
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestDealNotification();