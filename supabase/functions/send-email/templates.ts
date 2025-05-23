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
    buttonUrl: 'https://equitymd.com/admin/dashboard'
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