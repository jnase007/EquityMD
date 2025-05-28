import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { FileText, AlertTriangle, Scale, Shield, Building2, Users, ExternalLink } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <PageBanner 
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our platform"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: March 26, 2025
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">Important Notice</h3>
                  <p className="text-yellow-800">
                    By accessing or using EquityMD, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our platform.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-blue-600" />
              Platform Overview
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD is a marketplace platform that connects accredited investors with real estate investment opportunities. We provide a technology platform for real estate firms and syndicators to list their investment opportunities and for accredited investors to discover these opportunities. EquityMD is not a broker-dealer, investment advisor, or intermediary, and does not participate in any investment transactions.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              User Eligibility and Accounts
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                To use EquityMD, you must:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Be at least 18 years old</li>
                <li>Have the legal capacity to enter into these terms</li>
                <li>Be an accredited investor (for investment opportunities)</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
              <p className="text-gray-600">
                You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Scale className="h-6 w-6 mr-2 text-blue-600" />
              Platform Services
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                EquityMD provides the following services:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Listing of real estate investment opportunities by verified syndicators</li>
                <li>Tools for investors to discover and evaluate opportunities</li>
                <li>Communication platform between investors and syndicators</li>
                <li>Document sharing and management capabilities</li>
              </ul>
              <p className="text-gray-600">
                We do not:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Provide investment advice or recommendations</li>
                <li>Participate in investment transactions</li>
                <li>Hold or manage investor funds</li>
                <li>Guarantee investment outcomes</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Fees and Payments
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD charges subscription and listing fees to real estate firms and syndicators for platform access and deal listings. These fees are clearly disclosed and are not tied to investment amounts or success. Investors may access basic features for free or opt for premium features through a subscription. All fees are subject to change with notice.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              User Conduct
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                Users agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Provide false or misleading information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with platform operations</li>
                <li>Share account credentials</li>
                <li>Circumvent platform fees or processes</li>
                <li>Harass or harm other users</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Content and Intellectual Property
            </h2>
            <p className="text-gray-600 mb-8">
              Users retain ownership of their content but grant EquityMD a license to use, display, and distribute content on the platform. EquityMD owns all platform intellectual property, including trademarks, logos, and software. Users may not copy, modify, or distribute platform content without permission.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-blue-600" />
              Disclaimers and Limitations
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                EquityMD:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Provides the platform "as is" without warranties</li>
                <li>Does not verify accuracy of user-provided information</li>
                <li>Is not responsible for investment outcomes</li>
                <li>May modify or discontinue services at any time</li>
                <li>Limits liability to the maximum extent permitted by law</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Scale className="h-6 w-6 mr-2 text-blue-600" />
              Dispute Resolution
            </h2>
            <p className="text-gray-600 mb-8">
              Any disputes will be resolved through binding arbitration in Delaware, except where prohibited by law. Users waive rights to class actions. This agreement is governed by Delaware law without regard to conflict of law principles.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Termination
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD may suspend or terminate accounts for violations of these terms. Users may terminate their accounts at any time. Certain provisions survive termination, including content licenses, disclaimers, and dispute resolution terms.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-4">
                For questions about these terms, please contact:
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium w-24">Email:</span>
                  <a href="mailto:hello@equitymd.com" className="text-blue-600 hover:text-blue-700">
                    hello@equitymd.com
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Address:</span>
                  <span>3525 Hyland Ave Suite 235, Costa Mesa, CA 92626</span>
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