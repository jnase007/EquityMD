import { Resend } from 'resend';

// Initialize Resend with API key from environment variable
export const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to create API key
export async function createApiKey(name: string) {
  try {
    const apiKey = await resend.apiKeys.create({ name });
    return apiKey;
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

// Helper function to list API keys
export async function listApiKeys() {
  try {
    const apiKeys = await resend.apiKeys.list();
    return apiKeys;
  } catch (error) {
    console.error('Error listing API keys:', error);
    throw error;
  }
}

// Helper function to send email
export async function sendEmail(to: string, subject: string, content: string) {
  try {
    const data = await resend.emails.send({
      from: 'notifications@equitymd.com',
      to,
      subject,
      html: content
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}