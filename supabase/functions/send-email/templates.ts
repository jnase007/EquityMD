export interface EmailTemplateProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface SignupNotificationProps {
  userType: 'investor' | 'syndicator';
  userName: string;
  userEmail: string;
  signupDate: string;
}

export interface InvestmentInterestProps {
  investorName: string;
  investorEmail: string;
  dealTitle: string;
  dealSlug: string;
  investmentAmount: string;
  message?: string;
  timestamp: string;
}

export interface NewMessageProps {
  senderName: string;
  senderType: 'investor' | 'syndicator';
  messagePreview: string;
  dealTitle?: string;
  dealSlug?: string;
  timestamp: string;
}

export function getBaseTemplate({
  title,
  content,
  buttonText,
  buttonUrl,
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      /* Reset */
      body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f1f5f9;
        -webkit-font-smoothing: antialiased;
      }
      .email-wrapper {
        width: 100%;
        background-color: #f1f5f9;
        padding: 40px 0;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .header {
        background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
        padding: 32px 40px;
        text-align: center;
      }
      .logo {
        font-size: 28px;
        font-weight: 800;
        color: white;
        text-decoration: none;
        letter-spacing: -0.5px;
      }
      .logo-md {
        color: #fbbf24;
      }
      .header-tagline {
        color: rgba(255,255,255,0.8);
        font-size: 13px;
        margin-top: 8px;
        letter-spacing: 0.5px;
      }
      .body-content {
        padding: 40px;
      }
      .title {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 24px 0;
        line-height: 1.3;
      }
      .content {
        color: #475569;
        font-size: 16px;
        line-height: 1.7;
      }
      .content p {
        margin: 0 0 16px 0;
      }
      .content ul, .content ol {
        margin: 16px 0;
        padding-left: 24px;
      }
      .content li {
        margin-bottom: 8px;
      }
      .button-container {
        text-align: center;
        margin: 32px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white !important;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);
        transition: all 0.2s ease;
      }
      .button:hover {
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.5);
      }
      .info-box {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-left: 4px solid #2563eb;
        border-radius: 0 12px 12px 0;
        padding: 20px 24px;
        margin: 24px 0;
      }
      .info-box h4 {
        margin: 0 0 12px 0;
        color: #1e293b;
        font-weight: 700;
        font-size: 15px;
      }
      .info-box p {
        margin: 0 0 8px 0;
        color: #475569;
        font-size: 14px;
        line-height: 1.5;
      }
      .info-box p:last-child {
        margin-bottom: 0;
      }
      .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        margin: 32px 0;
      }
      .footer {
        background: #f8fafc;
        padding: 32px 40px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
      }
      .footer-logo {
        font-size: 20px;
        font-weight: 800;
        color: #64748b;
        margin-bottom: 16px;
      }
      .footer-logo span {
        color: #2563eb;
      }
      .social-links {
        margin: 20px 0;
      }
      .social-link {
        display: inline-block;
        margin: 0 8px;
        color: #64748b;
        text-decoration: none;
      }
      .footer-text {
        font-size: 13px;
        color: #94a3b8;
        margin: 8px 0;
        line-height: 1.5;
      }
      .footer-links {
        margin-top: 16px;
      }
      .footer-links a {
        color: #64748b;
        text-decoration: none;
        font-size: 13px;
        margin: 0 12px;
      }
      .footer-links a:hover {
        color: #2563eb;
      }
      
      /* Mobile Responsive */
      @media only screen and (max-width: 600px) {
        .email-wrapper {
          padding: 16px !important;
        }
        .email-container {
          border-radius: 12px !important;
        }
        .header {
          padding: 24px 20px !important;
        }
        .body-content {
          padding: 24px 20px !important;
        }
        .footer {
          padding: 24px 20px !important;
        }
        .title {
          font-size: 20px !important;
        }
        .button {
          display: block !important;
          text-align: center !important;
          padding: 14px 24px !important;
        }
        .info-box {
          padding: 16px !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <a href="https://equitymd.com" class="logo">
            Equity<span class="logo-md">MD</span>
          </a>
          <div class="header-tagline">Your Marketplace for Real Estate Investments</div>
        </div>
        
        <!-- Body -->
        <div class="body-content">
          <h1 class="title">${title}</h1>
          
          <div class="content">
            ${content}
          </div>

          ${buttonText && buttonUrl ? `
            <div class="button-container">
              <a href="${buttonUrl}" class="button">
                ${buttonText} →
              </a>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">
            Equity<span>MD</span>
          </div>
          
          <div class="social-links">
            <a href="https://linkedin.com/company/equitymd" class="social-link">LinkedIn</a>
            <span style="color: #cbd5e1;">•</span>
            <a href="https://equitymd.com" class="social-link">Website</a>
          </div>
          
          <p class="footer-text">
            You received this email because you have an account on EquityMD.
          </p>
          
          <div class="footer-links">
            <a href="https://equitymd.com/profile">Manage Preferences</a>
            <a href="https://equitymd.com/legal/privacy">Privacy Policy</a>
            <a href="mailto:hello@equitymd.com">Contact Us</a>
          </div>
          
          <p class="footer-text" style="margin-top: 20px;">
            © ${new Date().getFullYear()} EquityMD. All rights reserved.<br>
            Connecting accredited investors with premium real estate opportunities.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

export function getNewInvestorSignupTemplate({
  userName,
  userEmail,
  signupDate,
}: SignupNotificationProps): string {
  const content = `
    <p>🎉 <strong>Great news!</strong> A new investor has joined the EquityMD platform.</p>
    
    <div class="info-box">
      <h4>New Investor Details:</h4>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Sign-up Date:</strong> ${signupDate}</p>
      <p><strong>Account Type:</strong> Investor</p>
    </div>
    
    <p>This investor is now able to:</p>
    <ul>
      <li>Browse investment opportunities</li>
      <li>View deal details and documentation</li>
      <li>Connect with syndicators</li>
      <li>Track their investment portfolio</li>
    </ul>
    
    <p>You may want to reach out to welcome them to the platform and help them get started with their first investment.</p>
  `;

  return getBaseTemplate({
    title: 'New Investor Registration - EquityMD',
    content,
    buttonText: 'View Admin Dashboard',
    buttonUrl: 'https://equitymd.com/admin'
  });
}

export function getNewSyndicatorSignupTemplate({
  userName,
  userEmail,
  signupDate,
}: SignupNotificationProps): string {
  const content = `
    <p>🏢 <strong>Exciting news!</strong> A new syndicator has joined the EquityMD platform.</p>
    
    <div class="info-box">
      <h4>New Syndicator Details:</h4>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Sign-up Date:</strong> ${signupDate}</p>
      <p><strong>Account Type:</strong> Syndicator</p>
    </div>
    
    <p>This syndicator can now:</p>
    <ul>
      <li>Create and list investment opportunities</li>
      <li>Manage deal documentation</li>
      <li>Connect with accredited investors</li>
      <li>Track fundraising progress</li>
    </ul>
    
    <p><strong>Next Steps:</strong></p>
    <ul>
      <li>Review their profile and verify credentials</li>
      <li>Approve their account for deal creation</li>
      <li>Provide onboarding assistance if needed</li>
    </ul>
  `;

  return getBaseTemplate({
    title: 'New Syndicator Registration - EquityMD',
    content,
    buttonText: 'Review Syndicator Profile',
    buttonUrl: 'https://equitymd.com/admin/syndicators'
  });
}

export function getWelcomeEmailTemplate(userType: 'investor' | 'syndicator', userName: string): string {
  const isInvestor = userType === 'investor';
  
  const content = `
    <p>Welcome to EquityMD, ${userName}! 🎉</p>
    
    <p>Thank you for joining our exclusive platform for real estate investment opportunities. We're excited to have you as part of our growing community of ${isInvestor ? 'investors' : 'syndicators'}.</p>
    
    <div class="info-box">
      <h4>What's Next?</h4>
      ${isInvestor ? `
        <p>• Complete your investor profile and accreditation verification</p>
        <p>• Browse our curated investment opportunities</p>
        <p>• Connect with experienced syndicators</p>
        <p>• Start building your real estate portfolio</p>
      ` : `
        <p>• Complete your syndicator profile and verification</p>
        <p>• List your first investment opportunity</p>
        <p>• Connect with accredited investors</p>
        <p>• Grow your investor network</p>
      `}
    </div>
    
    <p>If you have any questions or need assistance getting started, our team is here to help. Simply reply to this email or contact our support team.</p>
    
    <p>Welcome aboard!</p>
    <p><strong>The EquityMD Team</strong></p>
  `;

  return getBaseTemplate({
    title: `Welcome to EquityMD, ${userName}!`,
    content,
    buttonText: 'Complete Your Profile',
    buttonUrl: 'https://equitymd.com/dashboard'
  });
}

// New Investment Interest Template - Sent to Syndicators
export function getInvestmentInterestTemplate({
  investorName,
  investorEmail,
  dealTitle,
  dealSlug,
  investmentAmount,
  message,
  timestamp,
}: InvestmentInterestProps): string {
  const content = `
    <p>🎉 <strong>Great news!</strong> An investor has expressed interest in your deal.</p>
    
    <div class="info-box" style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-left-color: #10b981;">
      <h4 style="color: #059669;">💰 New Investment Interest</h4>
      <p><strong>Deal:</strong> ${dealTitle}</p>
      <p><strong>Investor:</strong> ${investorName}</p>
      <p><strong>Contact:</strong> ${investorEmail}</p>
      <p><strong>Interest Amount:</strong> <span style="color: #059669; font-weight: 700; font-size: 18px;">${investmentAmount}</span></p>
      <p><strong>Received:</strong> ${timestamp}</p>
    </div>
    
    ${message ? `
    <div class="info-box">
      <h4>💬 Message from Investor:</h4>
      <p style="font-style: italic;">"${message}"</p>
    </div>
    ` : ''}
    
    <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e;">
        <strong>⏰ Quick Response Matters!</strong><br>
        Investors who receive a response within 24 hours are 3x more likely to proceed with their investment.
      </p>
    </div>
    
    <p><strong>Recommended Next Steps:</strong></p>
    <ol style="color: #4b5563;">
      <li>Review the investor's interest and their profile</li>
      <li>Respond promptly to introduce yourself</li>
      <li>Share additional deal materials if requested</li>
      <li>Schedule a call to discuss the opportunity</li>
    </ol>
  `;

  return getBaseTemplate({
    title: `💰 New Investment Interest - ${dealTitle}`,
    content,
    buttonText: 'View & Respond Now',
    buttonUrl: `https://equitymd.com/inbox`
  });
}

// New Message Notification Template
export function getNewMessageTemplate({
  senderName,
  senderType,
  messagePreview,
  dealTitle,
  dealSlug,
  timestamp,
}: NewMessageProps): string {
  const senderLabel = senderType === 'investor' ? '💼 Investor' : '🏢 Syndicator';
  
  const content = `
    <p>You have a new message from ${senderLabel === '💼 Investor' ? 'an investor' : 'a syndicator'} on EquityMD.</p>
    
    <div class="info-box">
      <h4>${senderLabel}: ${senderName}</h4>
      ${dealTitle ? `<p><strong>Regarding:</strong> ${dealTitle}</p>` : ''}
      <p><strong>Received:</strong> ${timestamp}</p>
    </div>
    
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #374151; font-style: italic;">
        "${messagePreview.length > 200 ? messagePreview.substring(0, 200) + '...' : messagePreview}"
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Reply directly on EquityMD to continue the conversation.
    </p>
  `;

  return getBaseTemplate({
    title: `New Message from ${senderName}`,
    content,
    buttonText: 'View & Reply',
    buttonUrl: 'https://equitymd.com/inbox'
  });
}

export interface NewDealListedProps {
  syndicatorName: string;
  syndicatorEmail: string;
  dealTitle: string;
  dealSlug: string;
  propertyType: string;
  location: string;
  minimumInvestment: string;
  targetIrr?: string;
  listedDate: string;
}

export function getNewDealListedTemplate({
  syndicatorName,
  syndicatorEmail,
  dealTitle,
  dealSlug,
  propertyType,
  location,
  minimumInvestment,
  targetIrr,
  listedDate,
}: NewDealListedProps): string {
  const content = `
    <p>🏢 <strong>New Deal Listed!</strong> A syndicator has published a new investment opportunity.</p>
    
    <div class="info-box" style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-left-color: #2563eb;">
      <h4 style="color: #1e40af;">📋 Deal Details</h4>
      <p><strong>Title:</strong> ${dealTitle}</p>
      <p><strong>Property Type:</strong> ${propertyType}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Minimum Investment:</strong> ${minimumInvestment}</p>
      ${targetIrr ? `<p><strong>Target IRR:</strong> ${targetIrr}%</p>` : ''}
      <p><strong>Listed:</strong> ${listedDate}</p>
    </div>
    
    <div class="info-box">
      <h4>👤 Syndicator Information</h4>
      <p><strong>Name:</strong> ${syndicatorName}</p>
      <p><strong>Email:</strong> ${syndicatorEmail}</p>
    </div>
    
    <p><strong>Admin Actions:</strong></p>
    <ul style="color: #4b5563;">
      <li>Review the deal for compliance and accuracy</li>
      <li>Verify syndicator credentials if not already verified</li>
      <li>Feature the deal if it meets quality standards</li>
      <li>Monitor for investor interest</li>
    </ul>
  `;

  return getBaseTemplate({
    title: `🏢 New Deal Listed: ${dealTitle}`,
    content,
    buttonText: 'View Deal',
    buttonUrl: `https://equitymd.com/deals/${dealSlug}`
  });
}

export function getInvestorLaunchTemplate(firstName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚀 You've Been Selected - Welcome to EquityMD</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 32px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 24px;
            text-align: center;
          }
          .logo span {
            color: #2563eb;
          }
          .hero-section {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 32px;
            border-radius: 8px 8px 0 0;
            text-align: center;
            margin: -32px -32px 32px -32px;
          }
          .hero-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          .hero-subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 24px;
          }
          .content {
            color: #4b5563;
            margin-bottom: 24px;
          }
          .stats-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            display: block;
            font-size: 24px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 4px;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
          }
          .deal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin: 32px 0;
          }
          .deal-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .deal-image {
            position: relative;
            height: 200px;
            overflow: hidden;
          }
          .deal-content {
            padding: 20px;
          }
          .deal-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .deal-location {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .deal-cta {
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            width: 100%;
            text-align: center;
          }
          .feature-list {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
          }
          .feature-list h3 {
            color: #1f2937;
            margin-bottom: 16px;
          }
          .feature-list ul {
            margin: 0;
            padding-left: 20px;
          }
          .feature-list li {
            margin-bottom: 8px;
            color: #4b5563;
          }
          .urgent-cta {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            margin: 32px 0;
          }
          .urgent-cta h3 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .urgent-cta p {
            opacity: 0.9;
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="hero-section">
              <div class="logo" style="color: white; margin-bottom: 16px;">
                Equity<span style="color: #fbbf24;">MD</span>
              </div>
              <div class="hero-title">🚀 You've Been Selected!</div>
              <div class="hero-subtitle">
                Welcome to EquityMD - The Premier Platform for Accredited Real Estate Investors
              </div>
            </div>
            
            <div class="content">
              <p><strong>Congratulations ${firstName}!</strong> You've been selected as a candidate for our exclusive real estate investment platform, EquityMD.</p>
              
              <p>We've identified you as a qualified accredited investor and are excited to invite you to join our growing community of sophisticated real estate investors.</p>
              
              <div class="stats-section">
                <h3 style="margin-bottom: 16px; color: #1f2937;">Platform Highlights</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-number">3+</span>
                    <span class="stat-label">Syndicators</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">7,400+</span>
                    <span class="stat-label">Investors</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">18.5%</span>
                    <span class="stat-label">Average IRR</span>
                  </div>
                </div>
              </div>
              
              <h3 style="color: #1f2937; margin: 32px 0 16px 0;">Featured Investment Opportunities</h3>
              <p>Take a look at some of the premium deals currently available on our platform:</p>
              
              <div class="deal-grid">
                <div class="deal-card">
                  <div class="deal-image">
                    <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg" alt="Newport Beach Residential Offering" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                  <div class="deal-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div class="deal-title">Newport Beach Residential Offering</div>
                      <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: flex; align-items: center;">
                        <span style="margin-right: 4px;">👑</span> Premier Partner
                      </div>
                    </div>
                    <div class="deal-location">Newport Beach, CA</div>
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-bottom: 16px;">
                      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Target Return</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">20% IRR</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Minimum</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">$250,000</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Term</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">2 years</div>
                        </div>
                      </div>
                    </div>
                    <a href="https://equitymd.com/deals/back-bay-newport" class="deal-cta">View Details ></a>
                  </div>
                </div>
                
                <div class="deal-card">
                  <div class="deal-image">
                    <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//adu.png" alt="Multifamily ADU Opportunity" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                  <div class="deal-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div class="deal-title">Multifamily ADU Opportunity</div>
                      <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: flex; align-items: center;">
                        <span style="margin-right: 4px;">👑</span> Premier Partner
                      </div>
                    </div>
                    <div class="deal-location">Southern California</div>
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-bottom: 16px;">
                      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Target Return</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">30% IRR</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Minimum</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">$50,000</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Term</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">3 years</div>
                        </div>
                      </div>
                    </div>
                    <a href="https://equitymd.com/deals/starboard-realty-adu" class="deal-cta">View Details ></a>
                  </div>
                </div>
                
                <div class="deal-card">
                  <div class="deal-image">
                    <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0982.jpeg" alt="Greenville Apartment Complex" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                  <div class="deal-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div class="deal-title">Greenville Apartment Complex</div>
                      <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: flex; align-items: center;">
                        <span style="margin-right: 4px;">👑</span> Premier Partner
                      </div>
                    </div>
                    <div class="deal-location">Travelers Rest, SC</div>
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-bottom: 16px;">
                      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Target Return</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">17.19% IRR</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Minimum</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">$50,000</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Term</div>
                          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">5 years</div>
                        </div>
                      </div>
                    </div>
                    <a href="https://equitymd.com/deals/satiric-development" class="deal-cta">View Details ></a>
                  </div>
                </div>
              </div>
              
              <div class="feature-list">
                <h3>🎯 Why Complete Your Profile?</h3>
                <ul>
                  <li><strong>Exclusive Access:</strong> View detailed deal documentation and financial projections</li>
                  <li><strong>Direct Communication:</strong> Connect directly with syndicators and ask questions</li>
                  <li><strong>Portfolio Tracking:</strong> Monitor your investments and track performance</li>
                  <li><strong>New Deals Monthly:</strong> Get early access to fresh opportunities hitting the market</li>
                  <li><strong>Professional Network:</strong> Build relationships with top-tier real estate professionals</li>
                </ul>
              </div>
              
              <div class="urgent-cta">
                <h3>⏰ Limited Time Opportunity</h3>
                <p>New deals are hitting the market every month. Complete your profile now to ensure you don't miss out on these exclusive investment opportunities.</p>
                <a href="https://equitymd.com/signup/start" class="button" style="background: white; color: #dc2626; font-weight: 600;">
                  Complete Your Profile Now
                </a>
              </div>
              
              <p style="margin-top: 32px;"><strong>About EquityMD:</strong></p>
              <p>EquityMD is the premier platform connecting accredited investors with exclusive commercial real estate opportunities. We partner with top-tier syndicators to bring you carefully vetted deals with strong return potential.</p>
              
              <p>Our platform provides transparency, professional due diligence, and direct access to syndicators - everything you need to make informed investment decisions.</p>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <a href="https://equitymd.com/signup/start" class="button">
                🚀 Get Started Now
              </a>
            </div>
          </div>

          <div class="footer">
            <p>You received this email because you've been selected as a qualified investor candidate.</p>
            <p>Questions? Contact us at hello@equitymd.com</p>
            <p>© 2025 EquityMD. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Deal Alert Template - New deal matching preferences
export interface DealAlertProps {
  investorName: string;
  dealTitle: string;
  dealSlug: string;
  propertyType: string;
  location: string;
  targetIrr: string;
  minimumInvestment: string;
  investmentTerm: string;
  syndicatorName: string;
  coverImageUrl?: string;
  matchReasons: string[];
}

export function getDealAlertTemplate({
  investorName,
  dealTitle,
  dealSlug,
  propertyType,
  location,
  targetIrr,
  minimumInvestment,
  investmentTerm,
  syndicatorName,
  coverImageUrl,
  matchReasons,
}: DealAlertProps): string {
  const content = `
    <p>Hi ${investorName},</p>
    
    <p>🎯 <strong>A new investment opportunity just hit the market that matches your preferences!</strong></p>
    
    <div style="background: white; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin: 24px 0;">
      ${coverImageUrl ? `
        <div style="height: 200px; overflow: hidden;">
          <img src="${coverImageUrl}" alt="${dealTitle}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      ` : ''}
      
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">NEW DEAL</span>
          <span style="background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${propertyType}</span>
        </div>
        
        <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #1e293b;">${dealTitle}</h2>
        <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">📍 ${location} • by ${syndicatorName}</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Target IRR</div>
            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${targetIrr}%</div>
          </div>
          <div style="text-align: center; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Minimum</div>
            <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${minimumInvestment}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Term</div>
            <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${investmentTerm}</div>
          </div>
        </div>
        
        <a href="https://equitymd.com/deals/${dealSlug}" style="display: block; text-align: center; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px;">
          View Deal Details →
        </a>
      </div>
    </div>
    
    <div class="info-box" style="background: #fffbeb; border-left-color: #f59e0b;">
      <h4 style="color: #b45309;">🎯 Why this deal matches you:</h4>
      <ul style="margin: 8px 0; padding-left: 20px;">
        ${matchReasons.map(reason => `<li style="color: #92400e; margin-bottom: 4px;">${reason}</li>`).join('')}
      </ul>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
      <strong>Pro tip:</strong> Investors who express interest early often get priority access to the best deals. Don't wait too long!
    </p>
  `;

  return getBaseTemplate({
    title: `🏢 New Deal Alert: ${dealTitle}`,
    content,
    buttonText: 'View All Deals',
    buttonUrl: 'https://equitymd.com/find'
  });
}

// Weekly Digest Template
export interface WeeklyDigestProps {
  investorName: string;
  newDealsCount: number;
  deals: Array<{
    title: string;
    slug: string;
    location: string;
    targetIrr: string;
    minimumInvestment: string;
    propertyType: string;
  }>;
  savedDealsReminder?: number;
  unreadMessages?: number;
}

export function getWeeklyDigestTemplate({
  investorName,
  newDealsCount,
  deals,
  savedDealsReminder,
  unreadMessages,
}: WeeklyDigestProps): string {
  const dealCards = deals.slice(0, 3).map(deal => `
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: white;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <span style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${deal.propertyType}</span>
          <h3 style="margin: 12px 0 4px 0; font-size: 17px; color: #1e293b;">${deal.title}</h3>
          <p style="margin: 0; color: #64748b; font-size: 13px;">📍 ${deal.location}</p>
        </div>
        <div style="text-align: right; margin-left: 20px;">
          <div style="font-size: 20px; font-weight: 700; color: #10b981;">${deal.targetIrr}%</div>
          <div style="font-size: 11px; color: #64748b;">Target IRR</div>
        </div>
      </div>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #64748b; font-size: 13px;">${deal.minimumInvestment} minimum</span>
        <a href="https://equitymd.com/deals/${deal.slug}" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">View Deal →</a>
      </div>
    </div>
  `).join('');

  const alertsSection = (savedDealsReminder || unreadMessages) ? `
    <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h4 style="margin: 0 0 12px 0; color: #92400e;">📌 Your Activity Reminders</h4>
      ${savedDealsReminder ? `<p style="margin: 0 0 8px 0; color: #78350f;">• You have <strong>${savedDealsReminder} saved deals</strong> waiting for your review</p>` : ''}
      ${unreadMessages ? `<p style="margin: 0; color: #78350f;">• You have <strong>${unreadMessages} unread messages</strong> from syndicators</p>` : ''}
    </div>
  ` : '';

  const content = `
    <p>Hi ${investorName},</p>
    
    <p>Here's what's new on EquityMD this week! 🎉</p>
    
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
      <div style="font-size: 40px; font-weight: 800; color: white;">${newDealsCount}</div>
      <div style="color: rgba(255,255,255,0.9); font-size: 16px;">New Deals This Week</div>
    </div>
    
    <h3 style="color: #1e293b; margin: 28px 0 16px 0;">🔥 Featured Opportunities</h3>
    
    ${dealCards}
    
    ${alertsSection}
    
    <div style="text-align: center; margin-top: 32px; padding: 24px; background: #f8fafc; border-radius: 12px;">
      <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px;">
        Don't miss out on the best investment opportunities.
      </p>
      <a href="https://equitymd.com/find" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
        Explore All Deals →
      </a>
    </div>
    
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px; text-align: center;">
      This is your weekly digest. You can adjust your email preferences in your <a href="https://equitymd.com/profile" style="color: #2563eb;">profile settings</a>.
    </p>
  `;

  return getBaseTemplate({
    title: `📊 Your Weekly Investment Digest`,
    content
  });
}

// Profile Incomplete Reminder
export interface ProfileIncompleteProps {
  userName: string;
  completionPercentage: number;
  missingItems: string[];
}

export function getProfileIncompleteTemplate({
  userName,
  completionPercentage,
  missingItems,
}: ProfileIncompleteProps): string {
  const content = `
    <p>Hi ${userName},</p>
    
    <p>We noticed your EquityMD profile is <strong>${completionPercentage}% complete</strong>. Completing your profile helps syndicators understand your investment preferences and ensures you see the most relevant deals!</p>
    
    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <div style="flex: 1; background: #e2e8f0; border-radius: 8px; height: 12px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #2563eb, #10b981); width: ${completionPercentage}%; height: 100%; border-radius: 8px;"></div>
        </div>
        <span style="font-weight: 700; color: #2563eb; font-size: 18px;">${completionPercentage}%</span>
      </div>
      
      <h4 style="margin: 0 0 12px 0; color: #1e293b;">Complete these items to unlock full access:</h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${missingItems.map(item => `
          <li style="color: #475569; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="color: #f59e0b;">○</span> ${item}
          </li>
        `).join('')}
      </ul>
    </div>
    
    <div class="info-box" style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-left-color: #10b981;">
      <h4 style="color: #059669;">✨ Benefits of a Complete Profile:</h4>
      <ul style="margin: 8px 0; padding-left: 20px; color: #065f46;">
        <li>Get matched with deals that fit your preferences</li>
        <li>Stand out to syndicators looking for serious investors</li>
        <li>Access exclusive deals and early opportunities</li>
        <li>Receive personalized investment recommendations</li>
      </ul>
    </div>
  `;

  return getBaseTemplate({
    title: `Complete Your Profile to Unlock More Deals`,
    content,
    buttonText: 'Complete My Profile',
    buttonUrl: 'https://equitymd.com/profile'
  });
}

// Deal Closing Soon Reminder
export interface DealClosingSoonProps {
  investorName: string;
  dealTitle: string;
  dealSlug: string;
  daysRemaining: number;
  targetIrr: string;
  minimumInvestment: string;
}

export function getDealClosingSoonTemplate({
  investorName,
  dealTitle,
  dealSlug,
  daysRemaining,
  targetIrr,
  minimumInvestment,
}: DealClosingSoonProps): string {
  const urgencyColor = daysRemaining <= 3 ? '#dc2626' : daysRemaining <= 7 ? '#f59e0b' : '#2563eb';
  
  const content = `
    <p>Hi ${investorName},</p>
    
    <div style="background: linear-gradient(135deg, ${daysRemaining <= 3 ? '#fef2f2' : '#fefce8'}, ${daysRemaining <= 3 ? '#fee2e2' : '#fef9c3'}); border: 2px solid ${urgencyColor}; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">⏰</div>
      <div style="font-size: 14px; color: ${urgencyColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Time Sensitive</div>
      <h2 style="margin: 12px 0; color: #1e293b; font-size: 20px;">This deal closes in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}!</h2>
    </div>
    
    <p>You saved <strong>${dealTitle}</strong> to your watchlist. This opportunity is closing soon - don't miss your chance to invest!</p>
    
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1e293b;">${dealTitle}</h3>
      <div style="display: flex; gap: 32px;">
        <div>
          <div style="font-size: 12px; color: #64748b;">Target IRR</div>
          <div style="font-size: 20px; font-weight: 700; color: #10b981;">${targetIrr}%</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b;">Minimum Investment</div>
          <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${minimumInvestment}</div>
        </div>
      </div>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">
      <strong>Why act now?</strong> Once the funding round closes, you'll need to wait for the next opportunity from this syndicator.
    </p>
  `;

  return getBaseTemplate({
    title: `⏰ ${dealTitle} Closes in ${daysRemaining} Days`,
    content,
    buttonText: 'View Deal & Invest Now',
    buttonUrl: `https://equitymd.com/deals/${dealSlug}`
  });
}