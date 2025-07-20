import { supabase } from './supabase';

export interface SignupEmailData {
  userName: string;
  userEmail: string;
  userType: 'investor' | 'syndicator';
  signupDate?: string;
}

// Get the Render email service URL from environment variables
const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'https://your-email-service.onrender.com';

/**
 * Send notification email to admin when a new user signs up
 */
export async function sendSignupNotificationEmail(data: SignupEmailData) {
  try {
    const emailType = data.userType === 'investor' ? 'new_investor_signup' : 'new_syndicator_signup';
    
    // Try Render email service first, fallback to Supabase
    if (EMAIL_SERVICE_URL && EMAIL_SERVICE_URL !== 'https://your-email-service.onrender.com') {
      try {
        const response = await fetch(`${EMAIL_SERVICE_URL}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: emailType,
            data: {
              userName: data.userName,
              userEmail: data.userEmail,
              signupDate: data.signupDate || new Date().toLocaleDateString()
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Signup notification email sent via Render service:', result);
          return result;
        }
      } catch (renderError) {
        console.warn('Render email service failed, falling back to Supabase:', renderError);
      }
    }

    // Fallback to Supabase Edge Function
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: emailType,
        data: {
          userName: data.userName,
          userEmail: data.userEmail,
          signupDate: data.signupDate || new Date().toLocaleDateString()
        }
      }
    });

    if (error) {
      console.error('Error sending signup notification email:', error);
      throw error;
    }

    console.log('Signup notification email sent via Supabase:', result);
    return result;
  } catch (error) {
    console.error('Failed to send signup notification email:', error);
    throw error;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(data: SignupEmailData) {
  try {
    // Try Render email service first, fallback to Supabase
    if (EMAIL_SERVICE_URL && EMAIL_SERVICE_URL !== 'https://your-email-service.onrender.com') {
      try {
        const response = await fetch(`${EMAIL_SERVICE_URL}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: data.userEmail,
            type: 'welcome_email',
            data: {
              userName: data.userName,
              userType: data.userType
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Welcome email sent via Render service:', result);
          return result;
        }
      } catch (renderError) {
        console.warn('Render email service failed, falling back to Supabase:', renderError);
      }
    }

    // Fallback to Supabase Edge Function
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.userEmail,
        type: 'welcome_email',
        data: {
          userName: data.userName,
          userType: data.userType
        }
      }
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    console.log('Welcome email sent via Supabase:', result);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Send both signup notification and welcome emails
 */
export async function sendSignupEmails(data: SignupEmailData) {
  try {
    // Send both emails concurrently
    const [notificationResult, welcomeResult] = await Promise.allSettled([
      sendSignupNotificationEmail(data),
      sendWelcomeEmail(data)
    ]);

    // Log results
    if (notificationResult.status === 'fulfilled') {
      console.log('Admin notification sent successfully');
    } else {
      console.error('Failed to send admin notification:', notificationResult.reason);
    }

    if (welcomeResult.status === 'fulfilled') {
      console.log('Welcome email sent successfully');
    } else {
      console.error('Failed to send welcome email:', welcomeResult.reason);
    }

    return {
      notificationSent: notificationResult.status === 'fulfilled',
      welcomeSent: welcomeResult.status === 'fulfilled'
    };
  } catch (error) {
    console.error('Error sending signup emails:', error);
    throw error;
  }
} 