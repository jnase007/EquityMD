import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Shield, Lock, UserCheck, FileText, Mail, Globe, Database, AlertTriangle } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-white/80 mt-1">How we collect, use, and protect your information</p>
            </div>
          </div>
          <p className="text-white/60 text-sm">Last updated: March 26, 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Commitment Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Our Commitment to Privacy</h3>
                <p className="text-blue-800">
                  EquityMD is committed to protecting your privacy and ensuring the security of your personal information. 
                  This policy explains how we collect, use, share, and protect your data when you use our platform.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                Information We Collect
              </h2>
              <div className="space-y-4 ml-13">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Information You Provide:</h3>
                  <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                    <li>Name, email address, and contact information</li>
                    <li>Professional and employment information</li>
                    <li>Accredited investor verification information</li>
                    <li>Investment preferences and criteria</li>
                    <li>Communications with other users through our platform</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Information Automatically Collected:</h3>
                  <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                    <li>Usage data and platform activity</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Provide and improve our platform services</li>
                <li>Process your registration and maintain your account</li>
                <li>Display investment opportunities listed by syndicators</li>
                <li>Send relevant communications and updates</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                </div>
                Information Sharing
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <strong className="text-gray-900">With Other Users:</strong>
                    <p className="text-gray-600">When you express interest in an investment, your profile may be shared with the relevant syndicator.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <strong className="text-gray-900">Service Providers:</strong>
                    <p className="text-gray-600">Trusted providers who assist in operating our platform, processing payments, and analyzing data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <strong className="text-gray-900">Legal Requirements:</strong>
                    <p className="text-gray-600">We may disclose information when required by law or to protect rights and safety.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
                Data Security
              </h2>
              <p className="text-gray-600 mb-4">We implement appropriate security measures including:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Encryption of sensitive data</li>
                <li>Secure data storage and transmission</li>
                <li>Access controls and authentication</li>
                <li>Regular security assessments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-cyan-600" />
                </div>
                Your Rights
              </h2>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>
            </section>

            {/* Contact */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">For privacy questions or to exercise your rights:</p>
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
