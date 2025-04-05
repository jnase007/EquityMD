import { supabase } from './lib/supabase';

async function sendTestEmail() {
  try {
    console.log('Sending test email...');

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'justin@brandastic.com',
        subject: 'Test Email from EquityMD',
        content: 'This is a test email to verify the email sending functionality is working correctly.',
        type: 'test'
      }
    });

    if (error) {
      console.error('Error response:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestEmail();