import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { AuthModal } from '../../components/AuthModal';
import { CheckCircle, AlertTriangle, FileText, DollarSign, Award, ArrowRight, Shield, Sparkles } from 'lucide-react';

export function Accreditation() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const requirements = [
    {
      title: "Income Requirement",
      description: "Individual income exceeding $200,000 (or $300,000 with spouse) in each of the past two years, with reasonable expectation of the same in current year.",
      icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
      color: "from-emerald-100 to-teal-100"
    },
    {
      title: "Net Worth Requirement",
      description: "Individual or joint net worth exceeding $1 million, excluding primary residence.",
      icon: <DollarSign className="h-6 w-6 text-blue-600" />,
      color: "from-blue-100 to-indigo-100"
    },
    {
      title: "Professional Certification",
      description: "Hold certain professional certifications, designations, or credentials in good standing.",
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      color: "from-purple-100 to-pink-100"
    }
  ];

  const verificationSteps = [
    "Complete accreditation questionnaire",
    "Provide supporting documentation",
    "Third-party verification (if required)",
    "Annual re-certification"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Accreditation Requirements</h1>
              <p className="text-white/80 mt-1">Understanding investor accreditation and verification process</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Requirements */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Accredited Investor Requirements</h2>
            </div>
            
            <div className="space-y-4">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className={`w-12 h-12 bg-gradient-to-br ${req.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {req.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{req.title}</h3>
                    <p className="text-gray-600">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Process */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Process</h2>
            </div>
            
            <div className="space-y-3">
              {verificationSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Important Notice</h3>
                <p className="text-amber-800">
                  Making false statements or providing incorrect information during the accreditation process may result in legal consequences and immediate termination of platform access.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
              <p className="text-emerald-100 mb-6">Complete your investor profile to begin browsing opportunities.</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
              >
                Create Account
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
