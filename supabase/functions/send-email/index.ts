import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getBaseTemplate, 
  getNewInvestorSignupTemplate, 
  getNewSyndicatorSignupTemplate, 
  getWelcomeEmailTemplate, 
  getInvestorLaunchTemplate, 
  getInvestmentInterestTemplate, 
  getNewMessageTemplate, 
  getNewDealListedTemplate,
  getDealAlertTemplate,
  getWeeklyDigestTemplate,
  getProfileIncompleteTemplate,
  getDealClosingSoonTemplate
} from './templates.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'hello@equitymd.com';
const ADMIN_EMAIL = 'justin@brandastic.com'; // Admin notification email

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

      case 'investor_launch':
        if (!data?.firstName || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for investor launch email' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getInvestorLaunchTemplate(data.firstName);
        emailTo = to;
        emailSubject = '🚀 You\'ve Been Selected - Welcome to EquityMD';
        break;

      case 'investment_interest':
        if (!data?.investorName || !data?.dealTitle || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for investment interest notification' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getInvestmentInterestTemplate({
          investorName: data.investorName,
          investorEmail: data.investorEmail || 'Not provided',
          dealTitle: data.dealTitle,
          dealSlug: data.dealSlug || '',
          investmentAmount: data.investmentAmount || 'Not specified',
          message: data.message,
          timestamp: data.timestamp || new Date().toLocaleString()
        });
        emailTo = to;
        emailSubject = `💰 New Investment Interest - ${data.dealTitle}`;
        break;

      case 'new_message':
        if (!data?.senderName || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for new message notification' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getNewMessageTemplate({
          senderName: data.senderName,
          senderType: data.senderType || 'investor',
          messagePreview: data.messagePreview || 'You have a new message.',
          dealTitle: data.dealTitle,
          dealSlug: data.dealSlug,
          timestamp: data.timestamp || new Date().toLocaleString()
        });
        emailTo = to;
        emailSubject = `💬 New Message from ${data.senderName}`;
        break;

      case 'new_deal_listed':
        if (!data?.dealTitle || !data?.syndicatorName) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for new deal notification' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getNewDealListedTemplate({
          syndicatorName: data.syndicatorName,
          syndicatorEmail: data.syndicatorEmail || 'Not provided',
          dealTitle: data.dealTitle,
          dealSlug: data.dealSlug || '',
          propertyType: data.propertyType || 'Not specified',
          location: data.location || 'Not specified',
          minimumInvestment: data.minimumInvestment || 'Not specified',
          targetIrr: data.targetIrr,
          listedDate: data.listedDate || new Date().toLocaleDateString()
        });
        emailTo = ADMIN_EMAIL;
        emailSubject = `🏢 New Deal Listed: ${data.dealTitle}`;
        break;

      case 'deal_alert':
        if (!data?.investorName || !data?.dealTitle || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for deal alert' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getDealAlertTemplate({
          investorName: data.investorName,
          dealTitle: data.dealTitle,
          dealSlug: data.dealSlug || '',
          propertyType: data.propertyType || 'Real Estate',
          location: data.location || 'Not specified',
          targetIrr: data.targetIrr || 'N/A',
          minimumInvestment: data.minimumInvestment || 'N/A',
          investmentTerm: data.investmentTerm || 'N/A',
          syndicatorName: data.syndicatorName || 'EquityMD Partner',
          coverImageUrl: data.coverImageUrl,
          matchReasons: data.matchReasons || ['Matches your investment preferences']
        });
        emailTo = to;
        emailSubject = `🏢 New Deal Alert: ${data.dealTitle}`;
        break;

      case 'weekly_digest':
        if (!data?.investorName || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for weekly digest' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getWeeklyDigestTemplate({
          investorName: data.investorName,
          newDealsCount: data.newDealsCount || 0,
          deals: data.deals || [],
          savedDealsReminder: data.savedDealsReminder,
          unreadMessages: data.unreadMessages
        });
        emailTo = to;
        emailSubject = `📊 Your Weekly Investment Digest - ${data.newDealsCount || 0} New Deals`;
        break;

      case 'profile_incomplete':
        if (!data?.userName || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for profile incomplete reminder' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getProfileIncompleteTemplate({
          userName: data.userName,
          completionPercentage: data.completionPercentage || 50,
          missingItems: data.missingItems || ['Complete your profile']
        });
        emailTo = to;
        emailSubject = `Complete Your Profile to Unlock More Deals`;
        break;

      case 'deal_closing_soon':
        if (!data?.investorName || !data?.dealTitle || !to) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for deal closing reminder' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        html = getDealClosingSoonTemplate({
          investorName: data.investorName,
          dealTitle: data.dealTitle,
          dealSlug: data.dealSlug || '',
          daysRemaining: data.daysRemaining || 7,
          targetIrr: data.targetIrr || 'N/A',
          minimumInvestment: data.minimumInvestment || 'N/A'
        });
        emailTo = to;
        emailSubject = `⏰ ${data.dealTitle} Closes in ${data.daysRemaining || 7} Days`;
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