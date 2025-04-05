import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageBanner } from '../../components/PageBanner';
import { AlertTriangle, Info, Scale, Shield, DollarSign, Users } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <PageBanner 
        title="Legal Disclaimer"
        subtitle="Important information about EquityMD's services and limitations"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            {/* Alert Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">Important Notice</h3>
                  <p className="text-yellow-800">
                    Please read this disclaimer carefully before using EquityMD's services. By using our platform, you acknowledge and agree to these terms and limitations.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Info className="h-6 w-6 mr-2 text-blue-600" />
              General Information Only
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD is a platform designed to connect accredited investors with real estate firms and syndicators by providing a space to list and discover investment opportunities. The information provided on this site, including deal listings, company profiles, and related content, is for informational and promotional purposes only. EquityMD does not provide investment advice, financial advice, or legal advice, nor does it endorse, recommend, or guarantee any investment opportunities listed on the platform.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Scale className="h-6 w-6 mr-2 text-blue-600" />
              No Broker-Dealer or Intermediary Status
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD is not a registered broker-dealer, funding portal, or investment advisor under the U.S. Securities and Exchange Commission (SEC) or any state securities regulator. We do not facilitate securities transactions, process investments, or hold investor funds. All investment transactions occur directly between investors and real estate firms or syndicators outside of this platform. EquityMD's role is limited to providing a marketing and listing service for real estate opportunities.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
              Fee Disclosure
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD charges real estate firms and syndicators a subscription fee (currently $750 per month) to access the platform and a listing fee (currently $500 per deal) to promote their investment opportunities. These fees are paid by the syndicators and do not represent a commission or percentage of any capital raised. Investors may also opt into a premium subscription (currently $75 per month) for enhanced features. EquityMD receives no compensation from investors for specific deal participation unless otherwise disclosed. All fees are subject to change, and any financial interest EquityMD has in promoting a deal will be disclosed in connection with that listing.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Accredited Investors Only
            </h2>
            <p className="text-gray-600 mb-8">
              Participation in investment opportunities listed on EquityMD is restricted to accredited investors as defined under Rule 501 of Regulation D of the Securities Act of 1933. Investors are responsible for verifying their accredited status and complying with all applicable securities laws. EquityMD does not verify investor accreditation beyond self-certification unless otherwise stated.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-blue-600" />
              No Guarantee of Outcomes
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD makes no representations or warranties regarding the accuracy, completeness, or reliability of information provided by real estate firms or syndicators on this platform. Investment opportunities involve significant risks, including the potential loss of principal, and past performance is not indicative of future results. Investors should conduct their own due diligence and consult with qualified financial, legal, and tax advisors before making any investment decisions.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Third-Party Transactions
            </h2>
            <p className="text-gray-600 mb-8">
              Any agreements, negotiations, or transactions resulting from connections made through EquityMD are solely between the investor and the real estate firm or syndicator. EquityMD is not a party to these transactions and bears no responsibility for their execution, terms, or outcomes.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Scale className="h-6 w-6 mr-2 text-blue-600" />
              Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-8">
              To the fullest extent permitted by law, EquityMD, its affiliates, and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of this platform, reliance on its content, or participation in any listed investment opportunities.
            </p>

            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Regulatory Compliance
            </h2>
            <p className="text-gray-600 mb-8">
              EquityMD operates in good faith to comply with applicable U.S. securities laws, including Regulation D. However, laws and regulations may change, and users are responsible for ensuring their own compliance with all relevant legal requirements.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                For questions about this disclaimer or EquityMD's services, please contact us at:
              </p>
              <a href="mailto:legal@equitymd.com" className="text-blue-600 hover:text-blue-700">
                legal@equitymd.com
              </a>
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