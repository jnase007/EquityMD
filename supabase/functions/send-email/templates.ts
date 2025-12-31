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
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 16px;
      }
      .content {
        color: #4b5563;
        margin-bottom: 24px;
      }
      .button {
        display: inline-block;
        background-color: #2563eb;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        margin-top: 24px;
        font-weight: 500;
      }
      .footer {
        margin-top: 32px;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }
      .info-box {
        background-color: #f3f4f6;
        border-left: 4px solid #2563eb;
        padding: 16px;
        margin: 16px 0;
      }
      .info-box h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-weight: 600;
      }
      .info-box p {
        margin: 0;
        color: #4b5563;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo">
          Equity<span>MD</span>
        </div>
        
        <div class="title">${title}</div>
        
        <div class="content">
          ${content}
        </div>

        ${buttonText && buttonUrl ? `
          <div style="text-align: center;">
            <a href="${buttonUrl}" class="button">
              ${buttonText}
            </a>
          </div>
        ` : ''}
      </div>

      <div class="footer">
        <p>You received this email because you have notifications enabled.</p>
        <p>To update your preferences, visit your profile settings.</p>
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
                    <span class="stat-number">20+</span>
                    <span class="stat-label">Syndicators</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">10,000+</span>
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