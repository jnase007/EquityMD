import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { FileText, AlertTriangle, Scale, Shield, Building2, Users, Mail } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Terms of Service</h1>
              <p className="text-white/80 mt-1">Please read these terms carefully before using our platform</p>
            </div>
          </div>
          <p className="text-white/60 text-sm">Last updated: March 26, 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Important Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Important Notice</h3>
                <p className="text-amber-800">
                  By accessing or using EquityMD, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our platform.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                Platform Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">
                EquityMD is a listing platform where real estate firms and syndicators may post their investment opportunities and accredited investors may discover these opportunities. EquityMD is not a broker-dealer, investment advisor, or intermediary. EquityMD does not facilitate introductions, make connections, or participate in any investment transactions. All communication and transactions occur independently between investors and syndicators outside of this platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                User Eligibility
              </h2>
              <p className="text-gray-600 mb-4">To use EquityMD, you must:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Be at least 18 years old</li>
                <li>Have the legal capacity to enter into these terms</li>
                <li>Be an accredited investor (for investment opportunities)</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Scale className="h-5 w-5 text-purple-600" />
                </div>
                Platform Services
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">We Provide:</h4>
                  <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                    <li>Listing of real estate investment opportunities by verified syndicators</li>
                    <li>Tools for investors to discover and evaluate opportunities</li>
                    <li>Communication platform between investors and syndicators</li>
                    <li>Document sharing and management capabilities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">We Do Not:</h4>
                  <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                    <li>Provide investment advice or recommendations</li>
                    <li>Participate in investment transactions</li>
                    <li>Hold or manage investor funds</li>
                    <li>Guarantee investment outcomes</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                User Conduct
              </h2>
              <p className="text-gray-600 mb-3">Users agree not to:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Provide false or misleading information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with platform operations</li>
                <li>Share account credentials</li>
                <li>Circumvent platform fees or processes</li>
                <li>Harass or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                Disclaimers & Limitations
              </h2>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Platform provided "as is" without warranties</li>
                <li>Does not verify accuracy of user-provided information</li>
                <li>Not responsible for investment outcomes</li>
                <li>May modify or discontinue services at any time</li>
                <li>Liability limited to the maximum extent permitted by law</li>
              </ul>
            </section>

            {/* Contact */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-4">For questions about these terms:</p>
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
