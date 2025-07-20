import { sendSignupEmails } from './lib/emailService';

async function testSignupEmails() {
  try {
    console.log('Testing signup email notifications...');

    // Test investor signup email
    console.log('\n1. Testing investor signup email...');
    const investorResult = await sendSignupEmails({
      userName: 'Dr. Justin Nassie',
      userEmail: 'justin@brandastic.com',
      userType: 'investor'
    });
    console.log('Investor email result:', investorResult);

    // Test syndicator signup email
    console.log('\n2. Testing syndicator signup email...');
    const syndicatorResult = await sendSignupEmails({
      userName: 'Jane Doe',
      userEmail: 'test.syndicator@example.com',
      userType: 'syndicator'
    });
    console.log('Syndicator email result:', syndicatorResult);

    console.log('\n✅ All email tests completed successfully!');
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Run the test
testSignupEmails(); 