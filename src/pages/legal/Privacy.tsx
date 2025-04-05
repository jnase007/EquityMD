import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { Shield, Lock, UserCheck, FileText, Mail, Globe, Database, AlertTriangle } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <PageBanner 
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal information"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: March 26, 2025
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold text-blue-800 mb-2">Our Commitment to Privacy</h3>
                  <p className="text-blue-800">
                    EquityMD is committed to protecting your privacy and ensuring the security of your personal information. 
                    This policy explains how we collect, use, share, and protect your data when you use our platform.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-600" />
              Information We Collect
            </h2>
            <div className="space-y-4 mb-8">
              <h3 className="font-bold">Information You Provide:</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Professional and employment information</li>
                <li>Accredited investor verification information</li>
                <li>Investment preferences and criteria</li>
                <li>Communications with other users through our platform</li>
              </ul>

              <h3 className="font-bold">Information Automatically Collected:</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage data and platform activity</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              How We Use Your Information
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Provide and improve our platform services</li>
                <li>Process your registration and maintain your account</li>
                <li>Connect investors with investment opportunities</li>
                <li>Send relevant communications and updates</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Analyze and improve our services</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <UserCheck className="h-6 w-6 mr-2 text-blue-600" />
              Information Sharing
            </h2>
            <p className="text-gray-600 mb-8">
              We share your information only in the following circumstances:
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-600">
                  <strong>With Other Users:</strong> When you express interest in an investment opportunity, your profile information may be shared with the relevant syndicator.
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-600">
                  <strong>Service Providers:</strong> We work with trusted service providers who assist in operating our platform, processing payments, and analyzing data.
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-600">
                  <strong>Legal Requirements:</strong> We may disclose information when required by law or to protect rights and safety.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Lock className="h-6 w-6 mr-2 text-blue-600" />
              Data Security
            </h2>
            <p className="text-gray-600 mb-8">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mb-8">
              <li>Encryption of sensitive data</li>
              <li>Secure data storage and transmission</li>
              <li>Access controls and authentication</li>
              <li>Regular security assessments</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Globe className="h-6 w-6 mr-2 text-blue-600" />
              Cookies and Tracking
            </h2>
            <p className="text-gray-600 mb-8">
              We use cookies and similar tracking technologies to enhance your experience and analyze platform usage. You can control cookie settings through your browser preferences. We use both session and persistent cookies for:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mb-8">
              <li>Authentication and security</li>
              <li>Preferences and functionality</li>
              <li>Analytics and performance</li>
              <li>Marketing and personalization</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <UserCheck className="h-6 w-6 mr-2 text-blue-600" />
              Your Rights and Choices
            </h2>
            <p className="text-gray-600 mb-8">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mb-8">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Control cookie settings</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Mail className="h-6 w-6 mr-2 text-blue-600" />
              Marketing Communications
            </h2>
            <p className="text-gray-600 mb-8">
              You can control your email preferences and opt-out of marketing communications at any time. However, we may still send transactional or relationship messages related to your account or investments.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-blue-600" />
              Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-8">
              We may update this privacy policy from time to time. We will notify you of any material changes through the platform or via email. Your continued use of EquityMD after such changes constitutes acceptance of the updated policy.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                For questions about this privacy policy or to exercise your rights, please contact our Privacy Team:
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium w-24">Email:</span>
                  <a href="mailto:privacy@equitymd.com" className="text-blue-600 hover:text-blue-700">
                    privacy@equitymd.com
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Address:</span>
                  <span>123 Investment Plaza, New York, NY 10001</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Phone:</span>
                  <span>(888) 555-0123</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              Last Updated: March 26, 2025
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}