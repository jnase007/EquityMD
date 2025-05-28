import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getBaseTemplate, getNewInvestorSignupTemplate, getNewSyndicatorSignupTemplate, getWelcomeEmailTemplate } from './templates.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'hello@equitymd.com';
const ADMIN_EMAIL = 'hello@equitymd.com'; // Replace with your admin email

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    const { to, subject, content, type, data } = body;

    // Validate Resend API key
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    let html: string;
    let emailTo: string;
    let emailSubject: string;

    // Handle different email types
    switch (type) {
      case 'new_investor_signup':
        if (!data?.userName || !data?.userEmail) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for new investor signup notification' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getNewInvestorSignupTemplate({
          userType: 'investor',
          userName: data.userName,
          userEmail: data.userEmail,
          signupDate: data.signupDate || new Date().toLocaleDateString()
        });
        emailTo = ADMIN_EMAIL;
        emailSubject = 'New Investor Registration - EquityMD';
        break;

      case 'new_syndicator_signup':
        if (!data?.userName || !data?.userEmail) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for new syndicator signup notification' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getNewSyndicatorSignupTemplate({
          userType: 'syndicator',
          userName: data.userName,
          userEmail: data.userEmail,
          signupDate: data.signupDate || new Date().toLocaleDateString()
        });
        emailTo = ADMIN_EMAIL;
        emailSubject = 'New Syndicator Registration - EquityMD';
        break;

      case 'welcome_email':
        if (!data?.userName || !data?.userType || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for welcome email' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getWelcomeEmailTemplate(data.userType, data.userName);
        emailTo = to;
        emailSubject = `Welcome to EquityMD, ${data.userName}!`;
        break;

      default:
        // Handle regular emails
        if (!to || !subject || !content) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: to, subject, and content are required' }),
            { 
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            }
          );
        }

        html = getBaseTemplate({
      title: subject,
      content: content.split('\n').map(line => `<p>${line}</p>`).join(''),
      buttonText: type === 'deal_update' ? 'View Investment Details' : undefined,
      buttonUrl: type === 'deal_update' && data?.deal_slug ? 
        `https://equitymd.com/deals/${data.deal_slug}` : undefined
    });
        emailTo = to;
        emailSubject = subject;
        break;
    }

    console.log('Sending email to:', emailTo);
    console.log('Subject:', emailSubject);
    console.log('Type:', type);

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: emailTo,
        subject: emailSubject,
        html,
        text: content || `Please view this email in HTML format.` // Fallback plain text version
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});