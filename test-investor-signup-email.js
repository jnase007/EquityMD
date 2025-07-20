import { sendSignupEmails } from './src/lib/emailService.js';

async function testInvestorSignupEmail() {
  try {
    console.log('🧪 Testing investor signup email system...');
    console.log('📧 Sending test email to justin@brandastic.com...');

    const result = await sendSignupEmails({
      userName: 'Dr. Justin Nassie',
      userEmail: 'justin@brandastic.com',
      userType: 'investor',
      signupDate: new Date().toLocaleDateString()
    });

    console.log('✅ Test email sent successfully!');
    console.log('📊 Results:', result);
    
    if (result.notificationSent) {
      console.log('✅ Admin notification email sent');
    } else {
      console.log('❌ Admin notification email failed');
    }
    
    if (result.welcomeSent) {
      console.log('✅ Welcome email sent');
    } else {
      console.log('❌ Welcome email failed');
    }

  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
}

testInvestorSignupEmail(); 