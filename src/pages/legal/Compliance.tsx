import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Shield, Scale, FileText, AlertTriangle, Users, Building2, CheckCircle, Gavel, Mail } from 'lucide-react';

export function Compliance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Gavel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">SEC Compliance</h1>
              <p className="text-white/80 mt-1">Our commitment to maintaining a trusted real estate investment platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Introduction */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Scale className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              EquityMD operates as a listing platform where real estate syndicators may post investment opportunities for accredited investors to discover. 
              We are not a broker-dealer, investment advisor, or intermediary. We do not facilitate introductions or connections between parties. 
              All communication and transactions occur independently between investors and syndicators outside of this platform.
            </p>
          </div>

          {/* Syndicator Requirements */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Syndicator Requirements</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: "Business Verification", desc: "All syndicators must provide proof of business registration, operating history, and track record in real estate investments." },
                { title: "Deal Documentation", desc: "Each listed opportunity must include comprehensive documentation, including property details, financial projections, and risk factors." },
                { title: "Transparency", desc: "Clear disclosure of fees, terms, and potential conflicts of interest is required for all listings." },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investor Guidelines */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Investor Guidelines</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: "Accreditation", desc: "Investors must self-certify their accredited status and maintain accurate profile information." },
                { title: "Due Diligence", desc: "Investors are responsible for conducting their own research and due diligence on all investment opportunities." },
                { title: "Professional Advice", desc: "We encourage all investors to consult with qualified financial and legal advisors before making investment decisions." },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Compliance */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Platform Compliance</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: "SEC Regulations", desc: "We design our platform with SEC regulations in mind, particularly Regulation D for private placements." },
                { title: "Data Protection", desc: "User data is protected in compliance with applicable privacy laws and industry best practices." },
                { title: "Regular Audits", desc: "We regularly review our practices to ensure continued compliance with applicable regulations." },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Investment Risk Warning</h3>
                <p className="text-amber-800 text-sm">
                  All investments involve risk. Past performance is not indicative of future results. Real estate investments are speculative and involve the risk of loss, including loss of principal. EquityMD does not guarantee any investment outcomes.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Compliance Questions</h2>
            <p className="text-gray-600 mb-4">For compliance-related inquiries:</p>
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

      <Footer />
    </div>
  );
}
