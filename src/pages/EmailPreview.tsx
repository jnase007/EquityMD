import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Mail, Eye, Send, Copy, Check } from 'lucide-react';

export function EmailPreview() {
  const [selectedEmail, setSelectedEmail] = useState<'investor' | 'syndicator' | 'welcome_investor' | 'welcome_syndicator' | 'investment_opportunity' | 'sms_deal_alert' | 'sms_welcome' | 'admin_new_investor' | 'admin_new_syndicator' | 'admin_user_message'>('investor');
  const [copied, setCopied] = useState(false);

  // Sample data for previews
  const sampleData = {
    investor: {
      userName: 'Dr. Sarah Johnson',
      userEmail: 'sarah.johnson@email.com',
      userType: 'investor' as const,
      signupDate: new Date().toLocaleDateString(),
    },
    syndicator: {
      userName: 'Michael Chen',
      userEmail: 'michael.chen@realestate.com',
      userType: 'syndicator' as const,
      signupDate: new Date().toLocaleDateString(),
      companyName: 'Premier Real Estate Ventures'
    },
    deal: {
      id: 'deal-123',
      title: 'Luxury Apartment Complex - Downtown Austin',
      location: 'Austin, TX',
      propertyType: 'Multi-Family',
      totalRaise: '$2,500,000',
      minInvestment: '$50,000',
      targetIRR: '18-22%',
      holdPeriod: '3-5 years',
      syndicatorName: 'Rodriguez Capital Partners',
      description: 'Prime downtown Austin location with 48 luxury units. Recently renovated with high-end finishes and amenities. Strong rental demand in growing tech hub.',
      highlights: [
        'Prime downtown location with walkability score of 95',
        'Recently renovated with luxury finishes',
        'Strong rental demand from tech professionals',
        'Projected 18-22% IRR over 3-5 year hold period'
      ]
    },
    message: {
      senderName: 'Dr. Sarah Johnson',
      senderEmail: 'sarah.johnson@email.com',
      recipientName: 'Austin Property Group',
      dealTitle: 'Luxury Apartments in Downtown Austin',
      messageContent: 'Hi, I\'m very interested in this investment opportunity. Could you please provide more details about the projected cash flow and the timeline for returns? I\'m looking to invest around $100,000. Thank you!',
      sentDate: new Date().toLocaleDateString()
    }
  };

  const getEmailHTML = (type: string) => {
    const baseStyles = `
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
        .message-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          font-style: italic;
        }
        .urgent {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
        }
      </style>
    `;

    switch (type) {
      case 'investor':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Investor Registration - EquityMD</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">New Investor Registration - EquityMD</div>
                  
                  <div class="content">
                    <p>🎉 <strong>Great news!</strong> A new investor has joined the EquityMD platform.</p>
                    
                    <div class="info-box">
                      <h4>New Investor Details:</h4>
                      <p><strong>Name:</strong> ${sampleData.investor.userName}</p>
                      <p><strong>Email:</strong> ${sampleData.investor.userEmail}</p>
                      <p><strong>Sign-up Date:</strong> ${sampleData.investor.signupDate}</p>
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
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/admin/dashboard" class="button">
                      View Admin Dashboard
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this email because you have notifications enabled.</p>
                  <p>To update your preferences, visit your profile settings.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'syndicator':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Syndicator Registration - EquityMD</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">New Syndicator Registration - EquityMD</div>
                  
                  <div class="content">
                    <p>🏢 <strong>Exciting news!</strong> A new syndicator has joined the EquityMD platform.</p>
                    
                    <div class="info-box">
                      <h4>New Syndicator Details:</h4>
                      <p><strong>Name:</strong> ${sampleData.syndicator.userName}</p>
                      <p><strong>Email:</strong> ${sampleData.syndicator.userEmail}</p>
                      <p><strong>Sign-up Date:</strong> ${sampleData.syndicator.signupDate}</p>
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
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/admin/syndicators" class="button">
                      Review Syndicator Profile
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this email because you have notifications enabled.</p>
                  <p>To update your preferences, visit your profile settings.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'welcome_investor':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to EquityMD, ${sampleData.investor.userName}!</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">Welcome to EquityMD, ${sampleData.investor.userName}!</div>
                  
                  <div class="content">
                    <p>Welcome to EquityMD, ${sampleData.investor.userName}! 🎉</p>
                    
                    <p>Thank you for joining our exclusive platform for real estate investment opportunities. We're excited to have you as part of our growing community of investors.</p>
                    
                    <div class="info-box">
                      <h4>What's Next?</h4>
                      <p>• Complete your investor profile and accreditation verification</p>
                      <p>• Browse our curated investment opportunities</p>
                      <p>• Connect with experienced syndicators</p>
                      <p>• Start building your real estate portfolio</p>
                    </div>
                    
                    <p>If you have any questions or need assistance getting started, our team is here to help. Simply reply to this email or contact our support team.</p>
                    
                    <p>Welcome aboard!</p>
                    <p><strong>The EquityMD Team</strong></p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/dashboard" class="button">
                      Complete Your Profile
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this email because you have notifications enabled.</p>
                  <p>To update your preferences, visit your profile settings.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'welcome_syndicator':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to EquityMD, ${sampleData.syndicator.userName}!</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">Welcome to EquityMD, ${sampleData.syndicator.userName}!</div>
                  
                  <div class="content">
                    <p>Welcome to EquityMD, ${sampleData.syndicator.userName}! 🎉</p>
                    
                    <p>Thank you for joining our exclusive platform for real estate investment opportunities. We're excited to have you as part of our growing community of syndicators.</p>
                    
                    <div class="info-box">
                      <h4>What's Next?</h4>
                      <p>• Complete your syndicator profile and verification</p>
                      <p>• List your first investment opportunity</p>
                      <p>• Connect with accredited investors</p>
                      <p>• Grow your investor network</p>
                    </div>
                    
                    <p>If you have any questions or need assistance getting started, our team is here to help. Simply reply to this email or contact our support team.</p>
                    
                    <p>Welcome aboard!</p>
                    <p><strong>The EquityMD Team</strong></p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/dashboard" class="button">
                      Complete Your Profile
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this email because you have notifications enabled.</p>
                  <p>To update your preferences, visit your profile settings.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'investment_opportunity':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Investment Opportunity - EquityMD</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">New Investment Opportunity - EquityMD</div>
                  
                  <div class="content">
                    <p>🏢 <strong>Exciting news!</strong> A new investment opportunity has been listed on the EquityMD platform.</p>
                    
                    <div class="info-box">
                      <h4>Investment Opportunity Details:</h4>
                      <p><strong>Title:</strong> ${sampleData.deal.title}</p>
                      <p><strong>Location:</strong> ${sampleData.deal.location}</p>
                      <p><strong>Property Type:</strong> ${sampleData.deal.propertyType}</p>
                      <p><strong>Total Raise:</strong> ${sampleData.deal.totalRaise}</p>
                      <p><strong>Minimum Investment:</strong> ${sampleData.deal.minInvestment}</p>
                      <p><strong>Target IRR:</strong> ${sampleData.deal.targetIRR}</p>
                      <p><strong>Hold Period:</strong> ${sampleData.deal.holdPeriod}</p>
                      <p><strong>Syndicator:</strong> ${sampleData.deal.syndicatorName}</p>
                    </div>
                    
                    <p>Description:</p>
                    <p>${sampleData.deal.description}</p>
                    
                    <p>Highlights:</p>
                    <ul>
                      ${sampleData.deal.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/investment-opportunity/${sampleData.deal.id}" class="button">
                      View Investment Opportunity
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this email because you have notifications enabled.</p>
                  <p>To update your preferences, visit your profile settings.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'sms_deal_alert':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>SMS Deal Alert Preview - EquityMD</title>
              ${baseStyles}
              <style>
                .sms-preview {
                  max-width: 320px;
                  margin: 20px auto;
                  background: #007AFF;
                  color: white;
                  padding: 12px 16px;
                  border-radius: 18px;
                  font-size: 16px;
                  line-height: 1.4;
                  white-space: pre-line;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .phone-frame {
                  max-width: 375px;
                  margin: 0 auto;
                  background: #000;
                  border-radius: 25px;
                  padding: 20px;
                  position: relative;
                }
                .phone-screen {
                  background: #f2f2f7;
                  border-radius: 15px;
                  padding: 20px;
                  min-height: 400px;
                }
                .message-header {
                  text-align: center;
                  color: #8e8e93;
                  font-size: 12px;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">SMS Deal Alert Preview</div>
                  
                  <div class="content">
                    <p>📱 <strong>SMS Preview:</strong> This is how the deal alert will appear on investors' phones.</p>
                    
                    <div class="phone-frame">
                      <div class="phone-screen">
                        <div class="message-header">
                          EquityMD • now
                        </div>
                        <div class="sms-preview">
                          ${getSMSContent('sms_deal_alert')}
                        </div>
                      </div>
                    </div>
                    
                    <div class="info-box">
                      <h4>SMS Details:</h4>
                      <p><strong>Character Count:</strong> ${getSMSContent('sms_deal_alert').length} characters</p>
                      <p><strong>Message Parts:</strong> ${Math.ceil(getSMSContent('sms_deal_alert').length / 160)} (${getSMSContent('sms_deal_alert').length <= 160 ? 'Single SMS' : 'Multiple SMS parts'})</p>
                      <p><strong>Estimated Cost:</strong> $${(Math.ceil(getSMSContent('sms_deal_alert').length / 160) * 0.05).toFixed(2)} per recipient</p>
                    </div>
                  </div>
                </div>

                <div class="footer">
                  <p>SMS will be sent via ClickSend to opted-in investors only.</p>
                  <p>Recipients can reply STOP to opt out at any time.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'sms_welcome':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>SMS Welcome Preview - EquityMD</title>
              ${baseStyles}
              <style>
                .sms-preview {
                  max-width: 320px;
                  margin: 20px auto;
                  background: #007AFF;
                  color: white;
                  padding: 12px 16px;
                  border-radius: 18px;
                  font-size: 16px;
                  line-height: 1.4;
                  white-space: pre-line;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .phone-frame {
                  max-width: 375px;
                  margin: 0 auto;
                  background: #000;
                  border-radius: 25px;
                  padding: 20px;
                  position: relative;
                }
                .phone-screen {
                  background: #f2f2f7;
                  border-radius: 15px;
                  padding: 20px;
                  min-height: 400px;
                }
                .message-header {
                  text-align: center;
                  color: #8e8e93;
                  font-size: 12px;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">SMS Welcome Preview</div>
                  
                  <div class="content">
                    <p>📱 <strong>SMS Preview:</strong> This welcome message is sent when investors opt-in to SMS alerts.</p>
                    
                    <div class="phone-frame">
                      <div class="phone-screen">
                        <div class="message-header">
                          EquityMD • now
                        </div>
                        <div class="sms-preview">
                          ${getSMSContent('sms_welcome')}
                        </div>
                      </div>
                    </div>
                    
                    <div class="info-box">
                      <h4>SMS Details:</h4>
                      <p><strong>Character Count:</strong> ${getSMSContent('sms_welcome').length} characters</p>
                      <p><strong>Message Parts:</strong> ${Math.ceil(getSMSContent('sms_welcome').length / 160)} (${getSMSContent('sms_welcome').length <= 160 ? 'Single SMS' : 'Multiple SMS parts'})</p>
                      <p><strong>Estimated Cost:</strong> $${(Math.ceil(getSMSContent('sms_welcome').length / 160) * 0.05).toFixed(2)} per recipient</p>
                    </div>
                  </div>
                </div>

                <div class="footer">
                  <p>SMS will be sent via ClickSend to opted-in investors only.</p>
                  <p>Recipients can reply STOP to opt out at any time.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'admin_new_investor':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>🎉 New Investor Signup - EquityMD Admin Alert</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">🎉 New Investor Signup Alert</div>
                  
                  <div class="content">
                    <p>Great news! A new investor has just signed up for EquityMD.</p>
                    
                    <div class="info-box">
                      <h4>New Investor Details:</h4>
                      <p><strong>Name:</strong> ${sampleData.investor.userName}</p>
                      <p><strong>Email:</strong> ${sampleData.investor.userEmail}</p>
                      <p><strong>Signup Date:</strong> ${sampleData.investor.signupDate}</p>
                      <p><strong>Account Type:</strong> Investor</p>
                      <p><strong>Status:</strong> Pending verification</p>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                      <li>Review their profile for completeness</li>
                      <li>Monitor their accreditation verification process</li>
                      <li>Send welcome email if not already automated</li>
                      <li>Add to investor newsletter if opted-in</li>
                    </ul>
                    
                    <p>This investor can now browse investment opportunities and begin the accreditation process. Consider reaching out to welcome them and offer onboarding assistance.</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/admin/dashboard?tab=users" class="button">
                      View User in Admin Dashboard
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this admin notification because user signup alerts are enabled.</p>
                  <p>EquityMD Admin Team • hello@equitymd.com</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'admin_new_syndicator':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>🏗️ New Syndicator Signup - EquityMD Admin Alert</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">🏗️ New Syndicator Signup Alert</div>
                  
                  <div class="content">
                    <p>Exciting news! A new syndicator has joined the EquityMD platform.</p>
                    
                    <div class="info-box urgent">
                      <h4>⚠️ ACTION REQUIRED - New Syndicator Details:</h4>
                      <p><strong>Name:</strong> ${sampleData.syndicator.userName}</p>
                      <p><strong>Email:</strong> ${sampleData.syndicator.userEmail}</p>
                      <p><strong>Company:</strong> ${sampleData.syndicator.companyName}</p>
                      <p><strong>Signup Date:</strong> ${sampleData.syndicator.signupDate}</p>
                      <p><strong>Account Type:</strong> Syndicator</p>
                      <p><strong>Status:</strong> Pending verification & approval</p>
                    </div>
                    
                    <p><strong>URGENT - Required Actions:</strong></p>
                    <ul>
                      <li><strong>Verify credentials and business registration</strong></li>
                      <li><strong>Review company profile and documentation</strong></li>
                      <li><strong>Approve account for deal creation privileges</strong></li>
                      <li><strong>Schedule onboarding call if needed</strong></li>
                      <li><strong>Set up compliance monitoring</strong></li>
                    </ul>
                    
                    <p>⏰ <strong>Note:</strong> Syndicator accounts require manual approval before they can list investment opportunities. Please review and approve within 24-48 hours.</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/admin/dashboard?tab=verification" class="button">
                      Review & Approve Syndicator
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this admin notification because syndicator signup alerts are enabled.</p>
                  <p>EquityMD Admin Team • hello@equitymd.com</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'admin_user_message':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>💬 New User Message - EquityMD Admin Alert</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">💬 New User-to-Syndicator Message Alert</div>
                  
                  <div class="content">
                    <p>A user has sent a message to a syndicator through the platform.</p>
                    
                    <div class="info-box">
                      <h4>Message Details:</h4>
                      <p><strong>From:</strong> ${sampleData.message.senderName} (${sampleData.message.senderEmail})</p>
                      <p><strong>To:</strong> ${sampleData.message.recipientName}</p>
                      <p><strong>Regarding:</strong> ${sampleData.message.dealTitle}</p>
                      <p><strong>Sent:</strong> ${sampleData.message.sentDate}</p>
                    </div>
                    
                    <div class="message-box">
                      <p><strong>Message Content:</strong></p>
                      <p>"${sampleData.message.messageContent}"</p>
                    </div>
                    
                    <p><strong>Platform Activity:</strong></p>
                    <ul>
                      <li>User engagement with syndicator content</li>
                      <li>Potential investment interest generated</li>
                      <li>Active communication facilitated through platform</li>
                    </ul>
                    
                    <p>This activity indicates healthy platform engagement. Monitor for successful connections and potential deal flow.</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/admin/dashboard?tab=analytics" class="button">
                      View Analytics Dashboard
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this admin notification because user activity alerts are enabled.</p>
                  <p>EquityMD Admin Team • hello@equitymd.com</p>
                </div>
              </div>
            </body>
          </html>
        `;

      default:
        return '<p>Email type not found</p>';
    }
  };

  const getSMSContent = (type: string) => {
    switch (type) {
      case 'sms_deal_alert':
        return `🏢 NEW CRE DEAL ALERT!

${sampleData.deal.title}
📍 ${sampleData.deal.location}
💰 Min: ${sampleData.deal.minInvestment}
📈 Target IRR: ${sampleData.deal.targetIRR}

View details: equitymd.com/deal/${sampleData.deal.id}

Reply STOP to opt out`;
      
      case 'sms_welcome':
        return `Welcome to EquityMD SMS alerts! 🎉

You'll receive 2-3 CRE deal alerts per week.

Manage preferences: equitymd.com/profile
Reply STOP to opt out

Msg & data rates may apply.`;
      
      default:
        return '';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getEmailHTML(selectedEmail));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const emailTypes = [
    { id: 'investor', label: 'New Investor (Admin)', icon: '🎉' },
    { id: 'syndicator', label: 'New Syndicator (Admin)', icon: '🏢' },
    { id: 'admin_new_investor', label: 'Admin: New Investor Signup', icon: '👥' },
    { id: 'admin_new_syndicator', label: 'Admin: New Syndicator Signup', icon: '🏗️' },
    { id: 'admin_user_message', label: 'Admin: User-to-Syndicator Message', icon: '💬' },
    { id: 'welcome_investor', label: 'Welcome Investor', icon: '👋' },
    { id: 'welcome_syndicator', label: 'Welcome Syndicator', icon: '🤝' },
    { id: 'investment_opportunity', label: 'New Investment Alert', icon: '🏢' },
    { id: 'sms_deal_alert', label: 'SMS Deal Alert', icon: '📱' },
    { id: 'sms_welcome', label: 'SMS Welcome', icon: '📲' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preview</h1>
          <p className="text-gray-600">Preview and test the signup notification emails before they go live.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Email Type Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Email Types
              </h2>
              <div className="space-y-2">
                {emailTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedEmail(type.id as any)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedEmail === type.id
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-900'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy HTML
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-600" />
                    Email Preview
                  </h2>
                  <div className="text-sm text-gray-500">
                    {emailTypes.find(t => t.id === selectedEmail)?.label}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={getEmailHTML(selectedEmail)}
                    className="w-full h-[600px] border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>

            {/* Sample Data Info */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Sample Data Used:</h3>
              <div className="text-sm text-blue-800">
                {(selectedEmail.includes('investor') && selectedEmail !== 'investment_opportunity') || selectedEmail === 'admin_new_investor' ? (
                  <div>
                    <p><strong>Name:</strong> {sampleData.investor.userName}</p>
                    <p><strong>Email:</strong> {sampleData.investor.userEmail}</p>
                    <p><strong>Type:</strong> Investor</p>
                  </div>
                ) : (selectedEmail.includes('syndicator') || selectedEmail === 'admin_new_syndicator') ? (
                  <div>
                    <p><strong>Name:</strong> {sampleData.syndicator.userName}</p>
                    <p><strong>Email:</strong> {sampleData.syndicator.userEmail}</p>
                    <p><strong>Company:</strong> {sampleData.syndicator.companyName}</p>
                    <p><strong>Type:</strong> Syndicator</p>
                  </div>
                ) : selectedEmail === 'investment_opportunity' ? (
                  <div>
                    <p><strong>Deal:</strong> {sampleData.deal.title}</p>
                    <p><strong>Location:</strong> {sampleData.deal.location}</p>
                    <p><strong>Total Raise:</strong> {sampleData.deal.totalRaise}</p>
                    <p><strong>Syndicator:</strong> {sampleData.deal.syndicatorName}</p>
                  </div>
                ) : selectedEmail === 'admin_user_message' ? (
                  <div>
                    <p><strong>From:</strong> {sampleData.message.senderName}</p>
                    <p><strong>To:</strong> {sampleData.message.recipientName}</p>
                    <p><strong>Deal:</strong> {sampleData.message.dealTitle}</p>
                    <p><strong>Message Type:</strong> User-to-Syndicator Contact</p>
                  </div>
                ) : selectedEmail.includes('sms') ? (
                  <div>
                    <p><strong>Message Type:</strong> SMS Alert</p>
                    <p><strong>Platform:</strong> ClickSend</p>
                    <p><strong>Target:</strong> Opted-in investors only</p>
                    <p><strong>Frequency:</strong> 2-3 messages per week</p>
                  </div>
                ) : null}
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 