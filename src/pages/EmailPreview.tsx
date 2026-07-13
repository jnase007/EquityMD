import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Mail, Eye, Send, Copy, Check, Download } from 'lucide-react';
import { MassEmailSender } from '../components/admin/MassEmailSender';

export function EmailPreview() {
  const [selectedEmail, setSelectedEmail] = useState<'investor' | 'syndicator' | 'welcome_investor' | 'welcome_syndicator' | 'investment_opportunity' | 'sms_deal_alert' | 'sms_welcome' | 'admin_new_investor' | 'admin_new_syndicator' | 'admin_user_message' | 'investor_launch' | 'deal_alert' | 'weekly_digest' | 'profile_incomplete' | 'deal_closing_soon' | 'mailchimp_drip1' | 'mailchimp_drip2' | 'mailchimp_drip3'>('investor');
  const [copied, setCopied] = useState(false);
  const [showMassSender, setShowMassSender] = useState(false);

  // Handle URL parameters for direct email access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailType = urlParams.get('type');
    
    if (emailType && isValidEmailType(emailType)) {
      setSelectedEmail(emailType as any);
    }
  }, []);

  const isValidEmailType = (type: string): type is 'investor' | 'syndicator' | 'welcome_investor' | 'welcome_syndicator' | 'investment_opportunity' | 'sms_deal_alert' | 'sms_welcome' | 'admin_new_investor' | 'admin_new_syndicator' | 'admin_user_message' | 'investor_launch' | 'deal_alert' | 'weekly_digest' | 'profile_incomplete' | 'deal_closing_soon' => {
    return ['investor', 'syndicator', 'welcome_investor', 'welcome_syndicator', 'investment_opportunity', 'sms_deal_alert', 'sms_welcome', 'admin_new_investor', 'admin_new_syndicator', 'admin_user_message', 'investor_launch', 'deal_alert', 'weekly_digest', 'profile_incomplete', 'deal_closing_soon', 'mailchimp_drip1', 'mailchimp_drip2', 'mailchimp_drip3'].includes(type);
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
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
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
                      <p>• Browse our investment opportunities</p>
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

      case 'new_message':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>💬 New Message - EquityMD</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">💬 You Have a New Message</div>
                  
                  <div class="content">
                    <p>Hi ${sampleData.message.recipientName},</p>
                    
                    <p>You have received a new message from <strong>${sampleData.message.senderName}</strong>.</p>
                    
                    <div class="info-box">
                      <h4>Message Preview:</h4>
                      <p><strong>From:</strong> ${sampleData.message.senderName}</p>
                      <p><strong>Regarding:</strong> ${sampleData.message.dealTitle}</p>
                      <p><strong>Received:</strong> ${sampleData.message.sentDate}</p>
                    </div>
                    
                    <div class="message-box">
                      <p>"${sampleData.message.messageContent}"</p>
                    </div>
                    
                    <p>Log in to your EquityMD account to view the full message and respond.</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/inbox" class="button">
                      View Message & Reply
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this email because you have message notifications enabled.</p>
                  <p>To update your preferences, visit your <a href="https://equitymd.com/settings">profile settings</a>.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'investment_interest':
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>💰 New Investment Interest - EquityMD</title>
              ${baseStyles}
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">
                    Equity<span>MD</span>
                  </div>
                  
                  <div class="title">💰 New Investment Interest</div>
                  
                  <div class="content">
                    <p>Great news! An investor has expressed interest in your deal.</p>
                    
                    <div class="info-box">
                      <h4>Investor Details:</h4>
                      <p><strong>Name:</strong> ${sampleData.message.senderName}</p>
                      <p><strong>Email:</strong> ${sampleData.message.senderEmail}</p>
                      <p><strong>Deal:</strong> ${sampleData.message.dealTitle}</p>
                      <p><strong>Investment Amount:</strong> $100,000</p>
                      <p><strong>Date:</strong> ${sampleData.message.sentDate}</p>
                    </div>
                    
                    ${sampleData.message.messageContent ? `
                    <div class="message-box">
                      <p><strong>Message from Investor:</strong></p>
                      <p>"${sampleData.message.messageContent}"</p>
                    </div>
                    ` : ''}
                    
                    <p>Log in to your EquityMD account to respond to this investor and continue the conversation.</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://equitymd.com/inbox" class="button">
                      Respond to Investor
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>You received this email because you have investment notifications enabled.</p>
                  <p>To update your preferences, visit your <a href="https://equitymd.com/settings">profile settings</a>.</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'investor_launch':
        return `          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="color-scheme" content="light" />
              <title>You've Been Selected — EquityMD</title>
              <style>
                body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
                img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; max-width: 100%; }
                body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: #F3F6FB; }
                a { color: #2563EB; }
                @media screen and (max-width: 620px) {
                  .container { width: 100% !important; }
                  .px { padding-left: 18px !important; padding-right: 18px !important; }
                  .hero-pad { padding: 28px 18px 24px !important; }
                  .h1 { font-size: 26px !important; line-height: 1.2 !important; }
                  .deal-metric { width: 33% !important; }
                }
              </style>
            </head>
            <body style="margin:0;padding:0;background:#F3F6FB;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;font-size:1px;line-height:1px;">
                Free deal flow you won't find elsewhere — review offerings from a broader syndicator network. Sign up free.
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F6FB;">
                <tr>
                  <td align="center" style="padding:28px 12px 40px;">
                    <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

                      <!-- Logo header -->
                      <tr>
                        <td align="center" style="padding:0 0 18px;">
                          <a href="https://equitymd.com" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                            <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos/logo-black.png" alt="EquityMD" width="168" style="width:168px;height:auto;margin:0 auto;" />
                          </a>
                        </td>
                      </tr>

                      <!-- Main card -->
                      <tr>
                        <td style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(15,23,42,0.08);border:1px solid #E8EEF7;">

                          <!-- Light hero -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="hero-pad" style="padding:36px 36px 28px;text-align:center;background:linear-gradient(180deg,#F8FBFF 0%,#FFFFFF 100%);border-bottom:1px solid #EDF2F7;">
                                <div style="display:inline-block;background:#EFF6FF;border:1px solid #BFDBFE;color:#1D4ED8;font-size:11px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;padding:6px 12px;border-radius:999px;margin-bottom:16px;">
                                  For accredited investors
                                </div>
                                <div class="h1" style="font-size:30px;line-height:1.2;font-weight:800;color:#0F172A;letter-spacing:-0.4px;margin:0 0 12px;">
                                  You've been selected
                                </div>
                                <div style="font-size:16px;line-height:1.55;color:#475569;max-width:460px;margin:0 auto 22px;">
                                  Welcome to EquityMD — a free marketplace for accredited investors to review more deal flow from a network of syndicators listing offerings you'll decide on, on your own terms.
                                </div>
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                                  <tr>
                                    <td align="center" bgcolor="#2563EB" style="border-radius:10px;">
                                      <a href="https://equitymd.com" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#2563EB;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:14px 26px;border-radius:10px;">
                                        Sign up free
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                                <div style="margin-top:10px;font-size:12px;color:#94A3B8;">Google or LinkedIn · free forever to browse and review deals</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Greeting -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:32px 36px 8px;color:#475569;font-size:15px;line-height:1.65;">
                                <p style="margin:0 0 14px;font-size:17px;color:#0F172A;"><strong>Hi *|FNAME:there|*!</strong></p>
                                <p style="margin:0 0 12px;">Thanks for checking out EquityMD — a free marketplace where accredited investors can see more deal flow in one place.</p>
                                <p style="margin:0 0 4px;">Syndicators list their own deals for you to review. You're not being matched or introduced through us — you decide. <strong style="color:#0F172A;">The benefit is deal flow:</strong> access to a network of offerings coming out this year that you’d be hard pressed to find elsewhere. <strong style="color:#0F172A;">Signup is free — no cost.</strong></p>
                              </td>
                            </tr>
                          </table>

                          <!-- Stats -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:22px 36px 8px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;">
                                  <tr>
                                    <td width="50%" align="center" style="padding:20px 10px;border-right:1px solid #E2E8F0;">
                                      <div style="font-size:26px;font-weight:800;color:#2563EB;line-height:1;">295+</div>
                                      <div style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.7px;margin-top:6px;">Syndicators</div>
                                    </td>
                                    <td width="50%" align="center" style="padding:20px 10px;">
                                      <div style="font-size:26px;font-weight:800;color:#2563EB;line-height:1;">18.5%</div>
                                      <div style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.7px;margin-top:6px;">Average IRR*</div>
                                    </td>
                                  </tr>
                                </table>
                                <div style="font-size:11px;color:#94A3B8;margin-top:8px;text-align:center;">*Platform-reported historical average. Not a guarantee of future results.</div>
                              </td>
                            </tr>
                          </table>

                          <!-- How it works video -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:28px 36px 8px;">
                                <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2563EB;margin-bottom:6px;">See the platform</div>
                                <div style="font-size:21px;font-weight:800;color:#0F172A;margin-bottom:8px;">How EquityMD works</div>
                                <div style="font-size:14px;color:#64748B;line-height:1.55;margin-bottom:14px;">Watch the commercial, then browse the marketplace deal flow and review offerings at your own pace.</div>
                                <a href="https://equitymd.com/how-it-works" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                                  <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/images/video_commercial.png" alt="Watch the EquityMD commercial" width="528" style="width:100%;max-width:528px;height:auto;border-radius:12px;box-shadow:0 6px 20px rgba(15,23,42,0.08);" />
                                </a>
                                <div style="text-align:center;margin-top:14px;">
                                  <a href="https://equitymd.com/how-it-works" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0F172A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;padding:12px 20px;border-radius:10px;">
                                    Watch & explore →
                                  </a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Featured header -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:32px 36px 6px;">
                                <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2563EB;margin-bottom:6px;">Live deal flow</div>
                                <div style="font-size:21px;font-weight:800;color:#0F172A;margin-bottom:8px;">Featured investment opportunities</div>
                                <div style="font-size:14px;color:#64748B;line-height:1.55;">Sign up free with Google or LinkedIn to unlock full details, documents, and a growing pipeline of deals to review this year.</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Deal 1 -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:16px 36px 8px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;background:#FFFFFF;">
                                  <tr>
                                    <td>
                                      <a href="https://equitymd.com/deals/value-add-multifamily-nashville-tn-msa" target="_blank" rel="noopener noreferrer">
                                        <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/deals/93e2f56c-ae12-44d0-b38c-b8fc44add3d5/64ce8eba-03e9-4635-b1ff-0b2fb741c8a8.jpg" alt="Value Add Multifamily Nashville, TN MSA" width="528" style="width:100%;max-width:528px;height:200px;object-fit:cover;" />
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:18px;">
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td valign="top">
                                            <div style="font-size:17px;font-weight:800;color:#0F172A;line-height:1.3;">Value Add Multifamily Nashville, TN MSA</div>
                                            <div style="font-size:13px;color:#64748B;margin-top:4px;">Murfreesboro, TN</div>
                                          </td>
                                          <td valign="top" align="right" width="84">
                                            <span style="display:inline-block;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;font-size:11px;font-weight:700;padding:5px 8px;border-radius:999px;">Verified</span>
                                          </td>
                                        </tr>
                                      </table>
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #F1F5F9;">
                                        <tr>
                                          <td class="deal-metric" width="33%" style="padding-top:12px;">
                                            <div style="font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;">Target</div>
                                            <div style="font-size:16px;font-weight:800;color:#2563EB;margin-top:3px;">17% IRR</div>
                                          </td>
                                          <td class="deal-metric" width="33%" style="padding-top:12px;">
                                            <div style="font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;">Minimum</div>
                                            <div style="font-size:16px;font-weight:800;color:#0F172A;margin-top:3px;">$100,000</div>
                                          </td>
                                          <td class="deal-metric" width="33%" style="padding-top:12px;">
                                            <div style="font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;">Term</div>
                                            <div style="font-size:16px;font-weight:800;color:#0F172A;margin-top:3px;">5 years</div>
                                          </td>
                                        </tr>
                                      </table>
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
                                        <tr>
                                          <td align="center" bgcolor="#2563EB" style="border-radius:10px;">
                                            <a href="https://equitymd.com/deals/value-add-multifamily-nashville-tn-msa" target="_blank" rel="noopener noreferrer" style="display:block;background:#2563EB;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:13px 16px;border-radius:10px;text-align:center;">
                                              Sign up to view deal →
                                            </a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Deal 2 -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:12px 36px 8px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;background:#FFFFFF;">
                                  <tr>
                                    <td>
                                      <a href="https://equitymd.com/deals/multifamily-adu-opportunity" target="_blank" rel="noopener noreferrer">
                                        <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//adu.png" alt="Multifamily ADU Opportunity" width="528" style="width:100%;max-width:528px;height:200px;object-fit:cover;" />
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:18px;">
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td valign="top">
                                            <div style="font-size:17px;font-weight:800;color:#0F172A;line-height:1.3;">Multifamily ADU Opportunity</div>
                                            <div style="font-size:13px;color:#64748B;margin-top:4px;">Southern California</div>
                                          </td>
                                          <td valign="top" align="right" width="118">
                                            <span style="display:inline-block;background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;font-size:11px;font-weight:700;padding:5px 8px;border-radius:999px;">Premier Partner</span>
                                          </td>
                                        </tr>
                                      </table>
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #F1F5F9;">
                                        <tr>
                                          <td class="deal-metric" width="33%" style="padding-top:12px;">
                                            <div style="font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;">Target</div>
                                            <div style="font-size:16px;font-weight:800;color:#2563EB;margin-top:3px;">30% IRR</div>
                                          </td>
                                          <td class="deal-metric" width="33%" style="padding-top:12px;">
                                            <div style="font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;">Minimum</div>
                                            <div style="font-size:16px;font-weight:800;color:#0F172A;margin-top:3px;">$50,000</div>
                                          </td>
                                          <td class="deal-metric" width="33%" style="padding-top:12px;">
                                            <div style="font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;">Term</div>
                                            <div style="font-size:16px;font-weight:800;color:#0F172A;margin-top:3px;">3 years</div>
                                          </td>
                                        </tr>
                                      </table>
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
                                        <tr>
                                          <td align="center" bgcolor="#2563EB" style="border-radius:10px;">
                                            <a href="https://equitymd.com/deals/multifamily-adu-opportunity" target="_blank" rel="noopener noreferrer" style="display:block;background:#2563EB;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:13px 16px;border-radius:10px;text-align:center;">
                                              Sign up to view deal →
                                            </a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Funded proof -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:12px 36px 8px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;background:#F8FAFC;">
                                  <tr>
                                    <td width="110" valign="top">
                                      <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0982.jpeg" alt="Greenville Apartment Complex" width="110" height="110" style="width:110px;height:110px;object-fit:cover;" />
                                    </td>
                                    <td valign="middle" style="padding:14px 16px;">
                                      <div style="font-size:11px;font-weight:700;color:#047857;letter-spacing:0.7px;text-transform:uppercase;margin-bottom:4px;">Funded & closed</div>
                                      <div style="font-size:15px;font-weight:800;color:#0F172A;">Greenville Apartment Complex</div>
                                      <div style="font-size:12px;color:#64748B;margin-top:3px;">Travelers Rest, SC · 17.19% target IRR · $50,000 min</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Why profile - light version -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:24px 36px 12px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:14px;">
                                  <tr>
                                    <td style="padding:22px 20px;">
                                      <div style="font-size:16px;font-weight:800;color:#1E3A8A;margin-bottom:12px;">Why create your free account</div>
                                      <div style="font-size:14px;color:#1E40AF;line-height:1.55;margin-bottom:8px;">• Full deal docs and projections to review yourself</div>
                                      <div style="font-size:14px;color:#1E40AF;line-height:1.55;margin-bottom:8px;">• More deal flow from a syndicator network you won't find in one place</div>
                                      <div style="font-size:14px;color:#1E40AF;line-height:1.55;margin-bottom:8px;">• New offerings launching throughout the year</div>
                                      <div style="font-size:14px;color:#1E40AF;line-height:1.55;margin-bottom:16px;">• No cost to join — browse and decide on your terms</div>
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td bgcolor="#2563EB" style="border-radius:10px;">
                                            <a href="https://equitymd.com" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#2563EB;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:13px 20px;border-radius:10px;">
                                              Sign up free with Google or LinkedIn
                                            </a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- About -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="px" style="padding:8px 36px 30px;color:#64748B;font-size:13px;line-height:1.6;">
                                <strong style="color:#0F172A;">About EquityMD</strong><br />
                                EquityMD is a free marketplace where accredited investors can review commercial real estate syndication deal flow. We are not a matchmaker or broker: syndicators list offerings, you decide. We do not facilitate transactions or provide investment advice. Always perform your own due diligence.
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td align="center" style="padding:26px 16px 8px;">
                          <a href="https://equitymd.com" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                            <img src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos/logo-black.png" alt="EquityMD" width="120" style="width:120px;height:auto;margin:0 auto 12px;opacity:0.9;" />
                          </a>
                          <div style="color:#64748B;font-size:12px;line-height:1.6;">
                            You received this because you signed up at
                            <a href="https://equitymd.com" target="_blank" rel="noopener noreferrer" style="color:#2563EB;text-decoration:none;">equitymd.com</a>.
                            <br />
                            Questions?
                            <a href="mailto:hello@equitymd.com" style="color:#2563EB;text-decoration:none;">hello@equitymd.com</a>
                            <br /><br />
                            © 2026 EquityMD. All rights reserved.
                          </div>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
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
                          <div style="color: #111827; font-weight: 600;">Value Add Multifamily Nashville, TN MSA</div>
                          <div style="color: #6b7280; font-size: 14px;">📍 Murfreesboro, TN · 17% Target IRR</div>
                        </div>
                        <a href="https://equitymd.com/deals/value-add-multifamily-nashville-tn-msa" style="color: #2563eb; font-size: 14px; text-decoration: none;">View →</a>
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

      case 'mailchimp_drip1':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>295+ CRE syndicators — all in one place</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 32px; }
    .button { display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; }
    .footer { margin-top: 32px; text-align: center; font-size: 14px; color: #6b7280; }
    .hero-section { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 32px; border-radius: 8px 8px 0 0; text-align: center; margin: -32px -32px 32px -32px; }
    .hero-title { font-size: 26px; font-weight: 700; margin-bottom: 12px; }
    .hero-subtitle { font-size: 16px; opacity: 0.9; }
    .operator-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
    .operator-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .operator-type { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .operator-count { font-size: 20px; font-weight: 700; color: #2563eb; }
    .highlight { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #0c4a6e; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="hero-section">
        <div style="font-size: 24px; font-weight: 800; color: white; margin-bottom: 16px;">Equity<span style="color: #fbbf24;">MD</span></div>
        <div class="hero-title">See More Deals. Review More Operators.</div>
        <div class="hero-subtitle">295+ syndicators with reviews, deal details, and track records — all in one place.</div>
      </div>
      <div style="color: #4b5563;">
        <p><strong>Hi *|FNAME:there|*,</strong></p>
        <p>Most investors only have access to deals from a few syndicators or firms they already know. That means you're only seeing a fraction of what's out there.</p>
        <p>EquityMD changes that. <strong>One site with 295+ syndicators</strong> — browse deals, read investor reviews, and dig into the details. All on your own time.</p>

        <div class="operator-grid">
          <div class="operator-card">
            <div class="operator-count">150+</div>
            <div class="operator-type">Multifamily</div>
          </div>
          <div class="operator-card">
            <div class="operator-count">80+</div>
            <div class="operator-type">Commercial / Mixed-Use</div>
          </div>
          <div class="operator-card">
            <div class="operator-count">60+</div>
            <div class="operator-type">Industrial / Retail</div>
          </div>
          <div class="operator-card">
            <div class="operator-count">79+</div>
            <div class="operator-type">Medical / Specialty</div>
          </div>
        </div>

        <p>What you get on EquityMD:</p>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 8px;"><strong>More deals</strong> — from operators across the country, not just the ones in your network</li>
          <li style="margin-bottom: 8px;"><strong>Investor reviews</strong> — see what other investors say about each syndicator</li>
          <li style="margin-bottom: 8px;"><strong>Deal details</strong> — returns, minimums, timelines, documents — all in one place to browse anytime</li>
        </ol>

        <div class="highlight">
          <strong>🏗️ New syndicators and deals are being added every week.</strong> The earlier you're on the platform, the more you'll see.
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://equitymd.com/directory" class="button">Browse Syndicators & Deals — Free</a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">Syndicators list their own profiles and deals. You browse, review, and connect with them directly. Free to explore — sign up with Google or LinkedIn for full access.</p>
      </div>
    </div>
    <div class="footer">
      <p>You received this email because you signed up at equitymd.com.</p>
      <p>Questions? <a href="mailto:hello@equitymd.com" style="color: #6b7280;">hello@equitymd.com</a> · <a href="https://equitymd.com" style="color: #6b7280;">equitymd.com</a></p>
      <p>© 2026 EquityMD. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

      case 'mailchimp_drip2':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Operators you probably haven't found yet</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; margin: 0; padding: 0; background-color: #f9fafb; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 32px; }
    p { margin-bottom: 16px; font-size: 15px; }
    a { color: #2563eb; }
    .search-example { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .search-query { font-weight: 600; color: #1f2937; font-size: 15px; }
    .search-result { color: #6b7280; font-size: 13px; margin-top: 4px; }
    .cta-block { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; }
    .signature { color: #6b7280; margin-top: 24px; }
    .ps { color: #6b7280; margin-top: 16px; font-style: italic; font-size: 14px; }
    .footer { margin-top: 32px; text-align: center; font-size: 13px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
        <span style="font-size: 22px; font-weight: 800; color: #1e293b;">Equity<span style="color: #2563eb;">MD</span></span>
      </div>
      <p>Hi *|FNAME:there|*,</p>
      <p>If you're like most CRE investors, you have access to deals from maybe 3-5 firms you know. That's a small window into a massive market.</p>
      <p>EquityMD opens that up. <strong>295+ syndicators</strong>, searchable by market and asset class. Each profile has deal details, track records, and investor reviews — so you can browse and evaluate on your own time.</p>
      <p>Here's what a quick search looks like:</p>

      <div class="search-example">
        <div class="search-query">🔍 "Multifamily · Texas"</div>
        <div class="search-result">47 operators — value-add, ground-up, ADU conversions</div>
      </div>

      <div class="search-example">
        <div class="search-query">🔍 "Industrial · Southeast"</div>
        <div class="search-result">23 operators — logistics, flex space, cold storage</div>
      </div>

      <div class="search-example">
        <div class="search-query">🔍 "Medical Office · West Coast"</div>
        <div class="search-result">12 operators — MOBs, urgent care, dental portfolios</div>
      </div>

      <p>You keep your existing relationships. EquityMD just makes sure you're seeing <strong>everything else</strong> that's out there.</p>

      <div class="cta-block">
        <a href="https://equitymd.com/directory" class="cta-btn">Search the Directory →</a>
      </div>

      <div class="signature">
        <p>— The EquityMD Team</p>
      </div>
      <div class="ps">
        <p>P.S. New syndicators and deals are being added every week. Free to browse — sign up with Google or LinkedIn for full access.</p>
      </div>
    </div>
    <div class="footer">
      <p>Questions? <a href="mailto:hello@equitymd.com" style="color: #6b7280;">hello@equitymd.com</a> · <a href="https://equitymd.com" style="color: #6b7280;">equitymd.com</a></p>
      <p>© 2026 EquityMD. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

      case 'mailchimp_drip3':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New operators are joining every week</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; margin: 0; padding: 0; background-color: #f9fafb; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 32px; }
    p { margin-bottom: 16px; font-size: 15px; }
    a { color: #2563eb; font-weight: 700; }
    .cta { text-align: center; font-size: 18px; margin: 28px 0; }
    .highlight { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .highlight strong { color: #1e40af; }
    .signature { color: #6b7280; margin-top: 24px; }
    .ps { color: #6b7280; margin-top: 16px; font-style: italic; font-size: 14px; }
    .footer { margin-top: 32px; text-align: center; font-size: 13px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
        <span style="font-size: 22px; font-weight: 800; color: #1e293b;">Equity<span style="color: #2563eb;">MD</span></span>
      </div>
      <p>Hi *|FNAME:there|*,</p>
      <p>Last note — then we'll let the site speak for itself.</p>
      <p>Here's the problem we keep hearing from investors: <strong>"I only see deals from the 2-3 firms I already know. I'm sure I'm missing opportunities."</strong></p>
      <p>You probably are. Most deal flow happens through closed networks. By the time you hear about a deal from someone outside your circle, it's already subscribed.</p>
      <p>EquityMD gives you one place to see it all — deals, reviews, syndicator track records — and browse whenever works for you. No calls, no pressure, no middleman.</p>

      <div class="highlight">
        <strong>What's on the platform:</strong><br>
        295+ syndicators across multifamily, industrial, retail, medical, and mixed-use. Investor reviews. Deal details. All searchable. Growing every week.
      </div>

      <p class="cta">→ <a href="https://equitymd.com/directory">Browse deals & reviews</a></p>

      <p>Free to use. When you see something interesting, you reach out to the operator directly.</p>
      <div class="signature">
        <p>— The EquityMD Team</p>
      </div>
      <div class="ps">
        <p>P.S. Bookmark <a href="https://equitymd.com" style="font-weight: normal;">equitymd.com</a> — new syndicators and deals are being added every week.</p>
      </div>
    </div>
    <div class="footer">
      <p>Questions? <a href="mailto:hello@equitymd.com" style="color: #6b7280; font-weight: normal;">hello@equitymd.com</a> · <a href="https://equitymd.com" style="color: #6b7280; font-weight: normal;">equitymd.com</a></p>
      <p>© 2026 EquityMD. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

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

  // Convert the live preview HTML into a Mailchimp-ready file.
  // Use Mailchimp default-value merge tags so empty FNAME becomes "there"
  // instead of blank: *|FNAME:there|*  →  "Hi Justin!" or "Hi there!"
  const mailchimpify = (html: string) => {
    return html
      // Collapse legacy long IF/ELSE first-name blocks → short default form
      .replace(
        /\*\|IF:FNAME\|\*\*\|FNAME\|\*\*\|ELSE:\|\*there\*\|END:IF\|\*/g,
        '*|FNAME:there|*'
      )
      // Bare FNAME → default form (skip tags that already have a default, e.g. *|FNAME:there|*)
      .replace(/\*\|FNAME\|\*/g, '*|FNAME:there|*');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mailchimpify(getEmailHTML(selectedEmail)));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadHTML = () => {
    const html = mailchimpify(getEmailHTML(selectedEmail));
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
    { id: 'new_message', label: 'New Message Notification', icon: '💬' },
    { id: 'investment_interest', label: 'Investment Interest', icon: '💰' },
    { id: 'welcome_investor', label: 'Welcome Investor', icon: '👋' },
    { id: 'welcome_syndicator', label: 'Welcome Syndicator', icon: '🤝' },
    { id: 'investment_opportunity', label: 'New Investment Alert', icon: '🏢' },
    { id: 'investor_launch', label: 'Investor Launch', icon: '🚀' },
    { id: 'deal_alert', label: 'Deal Alert (NEW)', icon: '🎯' },
    { id: 'weekly_digest', label: 'Weekly Digest (NEW)', icon: '📊' },
    { id: 'profile_incomplete', label: 'Profile Incomplete (NEW)', icon: '📝' },
    { id: 'deal_closing_soon', label: 'Deal Closing Soon (NEW)', icon: '⏰' },
    { id: 'sms_deal_alert', label: 'SMS Deal Alert', icon: '📱' },
    { id: 'sms_welcome', label: 'SMS Welcome', icon: '📲' },
    { id: 'mailchimp_drip1', label: 'Mailchimp Drip 1 — Directory', icon: '📧' },
    { id: 'mailchimp_drip2', label: 'Mailchimp Drip 2 — Discovery', icon: '📧' },
    { id: 'mailchimp_drip3', label: 'Mailchimp Drip 3 — Early Access', icon: '📧' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Email Preview | EquityMD" noindex={true} />
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
            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b">
              <button
                onClick={() => setShowMassSender(false)}
                className={`px-4 py-2 font-medium transition ${
                  !showMassSender
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setShowMassSender(true)}
                className={`px-4 py-2 font-medium transition ${
                  showMassSender
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mass Send
              </button>
            </div>

            {showMassSender ? (
              <MassEmailSender emailType={selectedEmail} />
            ) : (
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
            )}

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