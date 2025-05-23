import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Mail, Eye, Send, Copy, Check } from 'lucide-react';

export function EmailPreview() {
  const [selectedEmail, setSelectedEmail] = useState<'investor' | 'syndicator' | 'welcome_investor' | 'welcome_syndicator'>('investor');
  const [copied, setCopied] = useState(false);

  // Sample data for previews
  const sampleData = {
    investor: {
      userName: 'Dr. Sarah Chen',
      userEmail: 'sarah.chen@example.com',
      userType: 'investor' as const,
      signupDate: new Date().toLocaleDateString()
    },
    syndicator: {
      userName: 'Michael Rodriguez',
      userEmail: 'michael@rodriguezpartners.com',
      userType: 'syndicator' as const,
      signupDate: new Date().toLocaleDateString()
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

      default:
        return '<p>Email type not found</p>';
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
    { id: 'investor', label: 'New Investor Notification (Admin)', icon: '👤' },
    { id: 'syndicator', label: 'New Syndicator Notification (Admin)', icon: '🏢' },
    { id: 'welcome_investor', label: 'Welcome Email (Investor)', icon: '🎉' },
    { id: 'welcome_syndicator', label: 'Welcome Email (Syndicator)', icon: '🎉' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                {selectedEmail.includes('investor') ? (
                  <div>
                    <p><strong>Name:</strong> {sampleData.investor.userName}</p>
                    <p><strong>Email:</strong> {sampleData.investor.userEmail}</p>
                    <p><strong>Type:</strong> Investor</p>
                  </div>
                ) : (
                  <div>
                    <p><strong>Name:</strong> {sampleData.syndicator.userName}</p>
                    <p><strong>Email:</strong> {sampleData.syndicator.userEmail}</p>
                    <p><strong>Type:</strong> Syndicator</p>
                  </div>
                )}
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