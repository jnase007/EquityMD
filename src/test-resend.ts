import { resend, createApiKey, listApiKeys } from './lib/resend';

async function testResend() {
  try {
    // Test creating API key
    console.log('Creating API key...');
    const apiKey = await createApiKey('Test Key');
    console.log('API key created:', apiKey);

    // Test listing API keys
    console.log('\nListing API keys...');
    const apiKeys = await listApiKeys();
    console.log('API keys:', apiKeys);

    // Test sending email
    console.log('\nSending test email...');
    const emailResult = await resend.emails.send({
      from: 'notifications@equitymd.com',
      to: 'test@example.com', // Replace with your test email
      subject: 'Test Email from EquityMD',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the Resend integration is working correctly.</p>
      `
    });
    console.log('Email sent:', emailResult);

  } catch (error) {
    console.error('Error testing Resend:', error);
  }
}

testResend();