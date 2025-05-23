import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Mail, Send, CheckCircle, AlertCircle, User, Building2 } from 'lucide-react';
import { sendSignupEmails } from '../lib/emailService';

export function EmailTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [userType, setUserType] = useState<'investor' | 'syndicator'>('investor');

  const sendTestEmails = async () => {
    if (!testEmail || !testName) {
      alert('Please fill in both email and name fields');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const result = await sendSignupEmails({
        userName: testName,
        userEmail: testEmail,
        userType: userType
      });

      setResults({
        success: true,
        data: result,
        message: 'Test emails sent successfully!'
      });
    } catch (error) {
      console.error('Test email error:', error);
      setResults({
        success: false,
        error: error,
        message: 'Failed to send test emails'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email System Test</h1>
          <p className="text-gray-600">Send test signup emails to verify the email system is working properly.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Test Email Configuration
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your-email@example.com"
                />
                <p className="mt-1 text-sm text-gray-500">
                  The welcome email will be sent to this address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test User Name
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dr. John Smith"
                />
                <p className="mt-1 text-sm text-gray-500">
                  This name will appear in the email templates
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  onClick={() => setUserType('investor')}
                  className={`py-2 px-4 rounded-lg text-center flex items-center justify-center ${
                    userType === 'investor'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <User className="h-5 w-5 mr-2" />
                  Investor
                </button>
                <button
                  onClick={() => setUserType('syndicator')}
                  className={`py-2 px-4 rounded-lg text-center flex items-center justify-center ${
                    userType === 'syndicator'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Syndicator
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">What will be sent:</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <strong>Admin Notification:</strong> Sent to admin@equitymd.com with new {userType} signup details
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-green-600" />
                  <strong>Welcome Email:</strong> Sent to {testEmail || 'your test email'} with personalized welcome message
                </li>
              </ul>
            </div>

            <button
              onClick={sendTestEmails}
              disabled={loading || !testEmail || !testName}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Test Emails...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Emails
                </>
              )}
            </button>
          </div>

          {results && (
            <div className={`mt-6 p-4 rounded-lg ${
              results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                {results.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <h4 className={`font-semibold ${
                  results.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {results.message}
                </h4>
              </div>
              
              {results.success && (
                <div className="text-sm text-green-800">
                  <p><strong>Admin notification sent:</strong> {results.data.notificationSent ? '✅ Yes' : '❌ Failed'}</p>
                  <p><strong>Welcome email sent:</strong> {results.data.welcomeSent ? '✅ Yes' : '❌ Failed'}</p>
                </div>
              )}
              
              {!results.success && (
                <div className="text-sm text-red-800">
                  <p><strong>Error details:</strong></p>
                  <pre className="mt-2 bg-red-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(results.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• This will send real emails to the specified addresses</li>
            <li>• Admin notifications will always go to admin@equitymd.com</li>
            <li>• Make sure your Resend API key is properly configured</li>
            <li>• Check your spam folder if emails don't appear in inbox</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
} 