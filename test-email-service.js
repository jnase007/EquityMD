// Test script for the Render-hosted email service
const EMAIL_SERVICE_URL = process.env.VITE_EMAIL_SERVICE_URL || 'https://your-email-service.onrender.com';

async function testEmailService() {
  console.log('🧪 Testing Email Service Integration');
  console.log('📧 Email Service URL:', EMAIL_SERVICE_URL);
  
  try {
    // Test signup notification email
    console.log('\n📤 Testing signup notification email...');
    const notificationResponse = await fetch(`${EMAIL_SERVICE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'new_investor_signup',
        data: {
          userName: 'Test User',
          userEmail: 'test@example.com',
          signupDate: new Date().toLocaleDateString()
        }
      })
    });

    console.log('📊 Notification Response Status:', notificationResponse.status);
    
    if (notificationResponse.ok) {
      const result = await notificationResponse.json();
      console.log('✅ Signup notification test successful:', result);
    } else {
      const error = await notificationResponse.text();
      console.log('❌ Signup notification test failed:', error);
    }

    // Test welcome email
    console.log('\n📤 Testing welcome email...');
    const welcomeResponse = await fetch(`${EMAIL_SERVICE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'test@example.com',
        type: 'welcome_email',
        data: {
          userName: 'Test User',
          userType: 'investor'
        }
      })
    });

    console.log('📊 Welcome Response Status:', welcomeResponse.status);
    
    if (welcomeResponse.ok) {
      const result = await welcomeResponse.json();
      console.log('✅ Welcome email test successful:', result);
    } else {
      const error = await welcomeResponse.text();
      console.log('❌ Welcome email test failed:', error);
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testEmailService(); 