import { supabase } from './supabase';

export interface SignupEmailData {
  userName: string;
  userEmail: string;
  userType: 'investor' | 'syndicator';
  signupDate?: string;
}

/**
 * Send notification email to admin when a new user signs up
 */
export async function sendSignupNotificationEmail(data: SignupEmailData) {
  try {
    const emailType = data.userType === 'investor' ? 'new_investor_signup' : 'new_syndicator_signup';
    
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

    console.log('Signup notification email sent successfully:', result);
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

    console.log('Welcome email sent successfully:', result);
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