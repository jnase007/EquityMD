import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Mail, Eye, Send, Copy, Check, Download } from 'lucide-react';

export function EmailPreview() {
  const [selectedEmail, setSelectedEmail] = useState<'investor' | 'syndicator' | 'welcome_investor' | 'welcome_syndicator' | 'investment_opportunity' | 'sms_deal_alert' | 'sms_welcome' | 'admin_new_investor' | 'admin_new_syndicator' | 'admin_user_message' | 'investor_launch' | 'deal_alert' | 'weekly_digest' | 'profile_incomplete' | 'deal_closing_soon'>('investor');
  const [copied, setCopied] = useState(false);

  // Handle URL parameters for direct email access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailType = urlParams.get('type');
    
    if (emailType && isValidEmailType(emailType)) {
      setSelectedEmail(emailType as any);
    }
  }, []);

  const isValidEmailType = (type: string): type is 'investor' | 'syndicator' | 'welcome_investor' | 'welcome_syndicator' | 'investment_opportunity' | 'sms_deal_alert' | 'sms_welcome' | 'admin_new_investor' | 'admin_new_syndicator' | 'admin_user_message' | 'investor_launch' | 'deal_alert' | 'weekly_digest' | 'profile_incomplete' | 'deal_closing_soon' => {
    return ['investor', 'syndicator', 'welcome_investor', 'welcome_syndicator', 'investment_opportunity', 'sms_deal_alert', 'sms_welcome', 'admin_new_investor', 'admin_new_syndicator', 'admin_user_message', 'investor_launch', 'deal_alert', 'weekly_digest', 'profile_incomplete', 'deal_closing_soon'].includes(type);
  };

  const handleEmailTypeChange = (type: string) => {
    setSelectedEmail(type as any);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    window.history.pushState({}, '', url.toString());
  };

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
                    <a href="https://equitymd.com/admin" class="button">
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
                    <a href="https://equitymd.com/admin?tab=users" class="button">
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
                    <a href="https://equitymd.com/admin?tab=verification" class="button">
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
                    <a href="https://equitymd.com/admin?tab=analytics" class="button">
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

      case 'investor_launch':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>🚀 You've Been Selected - Welcome to EquityMD</title>
              ${baseStyles}
              <style>
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
                  transition: transform 0.2s, box-shadow 0.2s;
                }
                .deal-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }
                .deal-image {
                  width: 100%;
                  height: 200px;
                  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #6b7280;
                  font-weight: 600;
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
                  margin-bottom: 12px;
                }
                .deal-highlights {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  margin-bottom: 16px;
                }
                .deal-highlight {
                  background: #f3f4f6;
                  color: #374151;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 500;
                }
                .deal-cta {
                  background: #2563eb;
                  color: white;
                  text-decoration: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 500;
                  display: inline-block;
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
                  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                  gap: 24px;
                  margin-top: 20px;
                }
                .stat-item {
                  text-align: center;
                }
                .stat-number {
                  font-size: 24px;
                  font-weight: 700;
                  color: #2563eb;
                  display: block;
                }
                .stat-label {
                  font-size: 14px;
                  color: #6b7280;
                  margin-top: 4px;
                }
                .feature-list {
                  background: #f0f9ff;
                  border: 1px solid #bae6fd;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 24px 0;
                }
                .feature-list h3 {
                  color: #0369a1;
                  margin-bottom: 12px;
                  font-size: 16px;
                  font-weight: 600;
                }
                .feature-list ul {
                  margin: 0;
                  padding-left: 20px;
                }
                .feature-list li {
                  margin-bottom: 6px;
                  color: #0c4a6e;
                }
                .urgent-cta {
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
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
                    <!-- Video Commercial Image at Top -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="https://equitymd.com/how-it-works" style="display: inline-block; text-decoration: none;">
                        <img 
                          src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/images/video_commercial.png" 
                          alt="EquityMD Commercial Video" 
                          style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
                        />
                      </a>
                      <p style="margin-top: 12px; color: #6b7280; font-size: 14px;">Click to watch our commercial and learn how EquityMD works</p>
                    </div>
                    
                    <p><strong>Congratulations {{firstName}}!</strong> You've been selected as a candidate for our exclusive real estate investment platform, EquityMD.</p>
                    
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
                    
                    <h3 style="color: #1f2937; margin: 32px 0 16px 0;">See How EquityMD Works</h3>
                    <p style="margin-bottom: 24px; color: #6b7280;">Watch our commercial to learn how we connect accredited investors with institutional-quality real estate opportunities:</p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="https://equitymd.com/how-it-works" style="display: inline-block; text-decoration: none;">
                        <div style="position: relative; width: 100%; max-width: 500px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <div style="position: relative; padding-bottom: 56.25%; background: linear-gradient(45deg, #2563eb, #1d4ed8);">
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: white;">
                              <div style="text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 16px;">▶️</div>
                                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">EquityMD Commercial</div>
                                <div style="font-size: 14px; opacity: 0.9;">Click to watch and learn more</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                    
                    <h3 style="color: #1f2937; margin: 32px 0 16px 0;">Featured Investment Opportunities</h3>
                    <p>Take a look at some of the premium deals currently available on our platform:</p>
                    
                                         <div class="deal-grid">
                       <div class="deal-card" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                         <div class="deal-image" style="position: relative; height: 200px; overflow: hidden;">
                           <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg" alt="Newport Beach Residential Offering" style="width: 100%; height: 100%; object-fit: cover;">
                         </div>
                         <div class="deal-content" style="padding: 20px;">
                           <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                             <div class="deal-title" style="font-size: 18px; font-weight: 600; color: #1f2937;">Newport Beach Residential Offering</div>
                             <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: flex; align-items: center;">
                               <span style="margin-right: 4px;">👑</span> Premier Partner
                             </div>
                           </div>
                           <div class="deal-location" style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">Newport Beach, CA</div>
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
                           <a href="https://equitymd.com/deals/back-bay-newport" class="deal-cta" style="background: #2563eb; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-block; width: 100%; text-align: center;">View Details ></a>
                         </div>
                       </div>
                       
                       <div class="deal-card" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                         <div class="deal-image" style="position: relative; height: 200px; overflow: hidden;">
                           <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//adu.png" alt="Multifamily ADU Opportunity" style="width: 100%; height: 100%; object-fit: cover;">
                         </div>
                         <div class="deal-content" style="padding: 20px;">
                           <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                             <div class="deal-title" style="font-size: 18px; font-weight: 600; color: #1f2937;">Multifamily ADU Opportunity</div>
                             <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: flex; align-items: center;">
                               <span style="margin-right: 4px;">👑</span> Premier Partner
                             </div>
                           </div>
                           <div class="deal-location" style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">Southern California</div>
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
                           <a href="https://equitymd.com/deals/multifamily-adu-opportunity" class="deal-cta" style="background: #2563eb; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-block; width: 100%; text-align: center;">View Details ></a>
                         </div>
                       </div>
                       
                       <div class="deal-card" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                         <div class="deal-image" style="position: relative; height: 200px; overflow: hidden;">
                           <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0982.jpeg" alt="Greenville Apartment Complex" style="width: 100%; height: 100%; object-fit: cover;">
                         </div>
                         <div class="deal-content" style="padding: 20px;">
                           <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                             <div class="deal-title" style="font-size: 18px; font-weight: 600; color: #1f2937;">Greenville Apartment Complex</div>
                             <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: flex; align-items: center;">
                               <span style="margin-right: 4px;">👑</span> Premier Partner
                             </div>
                           </div>
                           <div class="deal-location" style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">Travelers Rest, SC</div>
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
                           <a href="https://equitymd.com/deals/greenville-apartment-complex" class="deal-cta" style="background: #2563eb; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-block; width: 100%; text-align: center;">View Details ></a>
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
                      <a href="https://equitymd.com" class="button" style="background: white; color: #2563eb; font-weight: 600;">
                        Complete Your Profile Now
                      </a>
                    </div>
                    
                    <p style="margin-top: 32px;"><strong>About EquityMD:</strong></p>
                    <p>EquityMD is the premier platform connecting accredited investors with exclusive commercial real estate opportunities. We partner with top-tier syndicators to bring you carefully vetted deals with strong return potential.</p>
                    
                    <p>Our platform provides transparency, professional due diligence, and direct access to syndicators - everything you need to make informed investment decisions.</p>
                  </div>

                  <div style="text-align: center; margin-top: 32px;">
                    <a href="https://equitymd.com" class="button">
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

      case 'deal_alert':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @media only screen and (max-width: 600px) {
                  .container { padding: 16px !important; }
                  .hero { padding: 24px !important; }
                  .cta-button { display: block !important; width: 100% !important; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px 32px; border-radius: 8px 8px 0 0; text-align: center;">
                  <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/images/equitymd-logo-white.png" alt="EquityMD" style="height: 32px;">
                </div>
                
                <!-- Main Content -->
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span style="background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">🎯 New Deal Match!</span>
                  </div>
                  
                  <h1 style="color: #111827; font-size: 24px; margin: 0 0 16px; text-align: center;">A Deal Matching Your Preferences Is Live</h1>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Hi ${sampleData.name.split(' ')[0]},</p>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Great news! A new investment opportunity matching your criteria is now available:</p>
                  
                  <!-- Deal Card -->
                  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">${sampleData.deal.title}</h2>
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">📍 ${sampleData.deal.location}</p>
                    
                    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                      <div style="flex: 1; min-width: 120px; background: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Minimum</div>
                        <div style="color: #111827; font-size: 18px; font-weight: 600;">${sampleData.deal.minInvestment}</div>
                      </div>
                      <div style="flex: 1; min-width: 120px; background: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Target IRR</div>
                        <div style="color: #059669; font-size: 18px; font-weight: 600;">${sampleData.deal.targetIRR}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="https://equitymd.com/deals/${sampleData.deal.id}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Deal Details →</a>
                  </div>
                  
                  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 24px 0 0;">This deal matches your preferences for Multifamily properties in Texas.</p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 24px;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    <a href="https://equitymd.com/settings" style="color: #2563eb; text-decoration: none;">Manage Preferences</a> · 
                    <a href="https://equitymd.com/unsubscribe" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
                  </p>
                  <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">© 2024 EquityMD. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'weekly_digest':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px 32px; border-radius: 8px 8px 0 0; text-align: center;">
                  <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/images/equitymd-logo-white.png" alt="EquityMD" style="height: 32px;">
                </div>
                
                <!-- Main Content -->
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">📊 Weekly Digest</span>
                  </div>
                  
                  <h1 style="color: #111827; font-size: 24px; margin: 0 0 8px; text-align: center;">Your Weekly CRE Update</h1>
                  <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0 0 24px;">Week of January 6, 2025</p>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Hi ${sampleData.name.split(' ')[0]},</p>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Here's what's happening on EquityMD this week:</p>
                  
                  <!-- Stats Row -->
                  <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                    <div style="flex: 1; background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
                      <div style="color: #059669; font-size: 24px; font-weight: 700;">3</div>
                      <div style="color: #6b7280; font-size: 12px;">New Deals</div>
                    </div>
                    <div style="flex: 1; background: #fef3c7; border-radius: 8px; padding: 16px; text-align: center;">
                      <div style="color: #d97706; font-size: 24px; font-weight: 700;">$2.4M</div>
                      <div style="color: #6b7280; font-size: 12px;">Invested</div>
                    </div>
                    <div style="flex: 1; background: #dbeafe; border-radius: 8px; padding: 16px; text-align: center;">
                      <div style="color: #1d4ed8; font-size: 24px; font-weight: 700;">142</div>
                      <div style="color: #6b7280; font-size: 12px;">New Investors</div>
                    </div>
                  </div>
                  
                  <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px;">🔥 Featured Deals This Week</h3>
                  
                  <!-- Deal List -->
                  <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                    <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="color: #111827; font-weight: 600;">Greenville Apartment Complex</div>
                          <div style="color: #6b7280; font-size: 14px;">📍 Dallas, TX · 17.19% Target IRR</div>
                        </div>
                        <a href="#" style="color: #2563eb; font-size: 14px; text-decoration: none;">View →</a>
                      </div>
                    </div>
                    <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="color: #111827; font-weight: 600;">Industrial Park Portfolio</div>
                          <div style="color: #6b7280; font-size: 14px;">📍 Houston, TX · 15.5% Target IRR</div>
                        </div>
                        <a href="#" style="color: #2563eb; font-size: 14px; text-decoration: none;">View →</a>
                      </div>
                    </div>
                    <div style="padding: 16px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="color: #111827; font-weight: 600;">Medical Office Building</div>
                          <div style="color: #6b7280; font-size: 14px;">📍 Austin, TX · 12.8% Target IRR</div>
                        </div>
                        <a href="#" style="color: #2563eb; font-size: 14px; text-decoration: none;">View →</a>
                      </div>
                    </div>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="https://equitymd.com/deals" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Browse All Deals</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 24px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2024 EquityMD. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'profile_incomplete':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px 32px; border-radius: 8px 8px 0 0; text-align: center;">
                  <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/images/equitymd-logo-white.png" alt="EquityMD" style="height: 32px;">
                </div>
                
                <!-- Main Content -->
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 64px; height: 64px; background: #fef3c7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">📝</div>
                  </div>
                  
                  <h1 style="color: #111827; font-size: 24px; margin: 0 0 16px; text-align: center;">Complete Your Profile</h1>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">Hi ${sampleData.name.split(' ')[0]}, your profile is 40% complete. Complete it to unlock all features.</p>
                  
                  <!-- Progress Bar -->
                  <div style="background: #e5e7eb; border-radius: 8px; height: 8px; margin-bottom: 24px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); height: 100%; width: 40%; border-radius: 8px;"></div>
                  </div>
                  
                  <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px;">What you're missing:</h3>
                  
                  <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                      <span style="color: #ef4444;">✗</span>
                      <span style="color: #4b5563;">Accreditation verification</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                      <span style="color: #ef4444;">✗</span>
                      <span style="color: #4b5563;">Investment preferences</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="color: #ef4444;">✗</span>
                      <span style="color: #4b5563;">Profile photo</span>
                    </div>
                  </div>
                  
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="color: #166534; margin: 0; font-size: 14px;"><strong>💡 Did you know?</strong> Complete profiles are 3x more likely to get approved for deals.</p>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="https://equitymd.com/profile" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Complete Profile Now</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 24px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2024 EquityMD. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'deal_closing_soon':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px 32px; border-radius: 8px 8px 0 0; text-align: center;">
                  <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/images/equitymd-logo-white.png" alt="EquityMD" style="height: 32px;">
                </div>
                
                <!-- Main Content -->
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span style="background: #fef2f2; color: #dc2626; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">⏰ CLOSING IN 48 HOURS</span>
                  </div>
                  
                  <h1 style="color: #111827; font-size: 24px; margin: 0 0 16px; text-align: center;">Don't Miss This Opportunity!</h1>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Hi ${sampleData.name.split(' ')[0]},</p>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">A deal you saved is closing soon. This is your last chance to invest!</p>
                  
                  <!-- Deal Card -->
                  <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">${sampleData.deal.title}</h2>
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">📍 ${sampleData.deal.location}</p>
                    
                    <!-- Countdown -->
                    <div style="text-align: center; margin-bottom: 16px;">
                      <div style="display: inline-flex; gap: 8px;">
                        <div style="background: white; padding: 12px 16px; border-radius: 8px; text-align: center;">
                          <div style="color: #dc2626; font-size: 24px; font-weight: 700;">01</div>
                          <div style="color: #6b7280; font-size: 10px; text-transform: uppercase;">Days</div>
                        </div>
                        <div style="background: white; padding: 12px 16px; border-radius: 8px; text-align: center;">
                          <div style="color: #dc2626; font-size: 24px; font-weight: 700;">23</div>
                          <div style="color: #6b7280; font-size: 10px; text-transform: uppercase;">Hours</div>
                        </div>
                        <div style="background: white; padding: 12px 16px; border-radius: 8px; text-align: center;">
                          <div style="color: #dc2626; font-size: 24px; font-weight: 700;">59</div>
                          <div style="color: #6b7280; font-size: 10px; text-transform: uppercase;">Minutes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style="display: flex; gap: 16px;">
                      <div style="flex: 1; background: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #6b7280; font-size: 12px;">Minimum</div>
                        <div style="color: #111827; font-size: 16px; font-weight: 600;">${sampleData.deal.minInvestment}</div>
                      </div>
                      <div style="flex: 1; background: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #6b7280; font-size: 12px;">Target IRR</div>
                        <div style="color: #059669; font-size: 16px; font-weight: 600;">${sampleData.deal.targetIRR}</div>
                      </div>
                      <div style="flex: 1; background: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #6b7280; font-size: 12px;">Funded</div>
                        <div style="color: #1d4ed8; font-size: 16px; font-weight: 600;">87%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="https://equitymd.com/deals/${sampleData.deal.id}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Invest Before It Closes →</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 24px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2024 EquityMD. All rights reserved.</p>
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

  const downloadHTML = () => {
    const html = getEmailHTML(selectedEmail);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equitymd-email-${selectedEmail}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    { id: 'investor_launch', label: '7,400+ Investor Launch', icon: '🚀' },
    { id: 'deal_alert', label: 'Deal Alert (NEW)', icon: '🎯' },
    { id: 'weekly_digest', label: 'Weekly Digest (NEW)', icon: '📊' },
    { id: 'profile_incomplete', label: 'Profile Incomplete (NEW)', icon: '📝' },
    { id: 'deal_closing_soon', label: 'Deal Closing Soon (NEW)', icon: '⏰' },
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
                    onClick={() => handleEmailTypeChange(type.id)}
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
                  <button
                    onClick={downloadHTML}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download for Mailchimp
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