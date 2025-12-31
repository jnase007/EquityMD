import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { AlertTriangle, Info, Scale, Shield, DollarSign, Users, Mail, FileWarning } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <FileWarning className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Legal Disclaimer</h1>
              <p className="text-white/80 mt-1">Important information about EquityMD's services and limitations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Alert Banner */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 mb-2">Important Notice</h3>
                <p className="text-red-800">
                  Please read this disclaimer carefully before using EquityMD's services. By using our platform, you acknowledge and agree to these terms and limitations.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                General Information Only
              </h2>
              <p className="text-gray-600 leading-relaxed">
                EquityMD is a listing platform where real estate firms and syndicators may post investment opportunities for accredited investors to discover. The information provided on this site, including deal listings, company profiles, and related content, is for informational purposes only. EquityMD does not facilitate introductions or connections between parties. EquityMD does not provide investment advice, financial advice, or legal advice, nor does it endorse, recommend, or guarantee any investment opportunities listed on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Scale className="h-5 w-5 text-purple-600" />
                </div>
                No Broker-Dealer Status
              </h2>
              <p className="text-gray-600 leading-relaxed">
                EquityMD is not a registered broker-dealer, funding portal, or investment advisor under the U.S. Securities and Exchange Commission (SEC) or any state securities regulator. We do not facilitate securities transactions, process investments, or hold investor funds. All investment transactions occur directly between investors and real estate firms or syndicators outside of this platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                Fee Disclosure
              </h2>
              <p className="text-gray-600 leading-relaxed">
                EquityMD charges real estate firms and syndicators a subscription fee (currently $750 per month) to access the platform and a listing fee (currently $500 per deal) to promote their investment opportunities. These fees are paid by the syndicators and do not represent a commission or percentage of any capital raised. Investors may also opt into a premium subscription (currently $75 per month) for enhanced features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                Accredited Investors Only
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Participation in investment opportunities listed on EquityMD is restricted to accredited investors as defined under Rule 501 of Regulation D of the Securities Act of 1933. Investors are responsible for verifying their accredited status and complying with all applicable securities laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                No Guarantee of Outcomes
              </h2>
              <p className="text-gray-600 leading-relaxed">
                EquityMD makes no representations or warranties regarding the accuracy, completeness, or reliability of information provided by real estate firms or syndicators on this platform. Investment opportunities involve significant risks, including the potential loss of principal, and past performance is not indicative of future results.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-cyan-600" />
                </div>
                Third-Party Transactions
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Any agreements, negotiations, or transactions resulting from connections made through EquityMD are solely between the investor and the real estate firm or syndicator. EquityMD is not a party to these transactions and bears no responsibility for their execution, terms, or outcomes.
              </p>
            </section>

            {/* Contact */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">For questions about this disclaimer:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href="mailto:hello@equitymd.com" className="text-blue-600 hover:text-blue-700 font-medium">
                    hello@equitymd.com
                  </a>
                </div>
                <p className="text-gray-500 text-sm">3525 Hyland Ave Suite 235, Costa Mesa, CA 92626</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
