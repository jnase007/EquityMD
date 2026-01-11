import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { FAQSection } from '../components/FAQSection';
import { AuthModal } from '../components/AuthModal';
import { Building2, Users, Shield, TrendingUp, Award, CheckCircle, ArrowRight, Sparkles, Target, Heart } from 'lucide-react';

// FAQ data for About page - company/platform questions
const aboutFaqs = [
  {
    question: "Who founded EquityMD and why?",
    answer: "EquityMD was founded by real estate professionals who saw a gap in the market - accredited investors struggled to find quality syndication opportunities, while syndicators had difficulty reaching qualified investors. We built a platform to connect both sides efficiently."
  },
  {
    question: "How is EquityMD different from crowdfunding platforms?",
    answer: "Unlike crowdfunding platforms that pool investments, EquityMD is a marketplace. We connect investors directly with syndicators - you invest directly with the sponsor, not through us. This gives you a direct relationship and full transparency with who manages your money."
  },
  {
    question: "Does EquityMD guarantee returns or vet every deal?",
    answer: "No. We verify syndicator credentials and display track records, but we don't guarantee returns or approve specific deals. Real estate investing involves risk. We provide the platform and information; investors must conduct their own due diligence."
  },
  {
    question: "How does EquityMD make money?",
    answer: "We charge syndicators a subscription fee to list their deals and access our investor network. The platform is completely free for investors - no fees to browse, save deals, or connect with syndicators."
  },
  {
    question: "Is my personal information secure on EquityMD?",
    answer: "Yes. We use bank-level encryption, never share your information with third parties without consent, and follow strict data protection practices. Syndicators only see your information when you choose to connect with them."
  }
];

export function About() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO 
        title="About Equitymd.com | Premier CRE Syndication Hub"
        description="Equitymd.com empowers CRE syndicators to reach 7,400+ elite investors for $149/month. Discover our mission to simplify syndication—join free as an investor today!"
        keywords="about EquityMD, CRE syndication platform, commercial real estate marketplace, real estate investment platform"
        canonical="https://equitymd.com/about"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Building2 
              key={i}
              className="absolute text-white/5"
              style={{
                left: `${10 + i * 20}%`,
                top: `${15 + (i % 2) * 40}%`,
                width: `${40 + i * 10}px`,
                height: `${40 + i * 10}px`,
                transform: `rotate(${-10 + i * 5}deg)`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-20 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            About Us
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Democratizing Real Estate Investment
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Connecting elite investors with premier CRE syndication opportunities
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EquityMD simplifies commercial real estate syndication by connecting verified syndicators 
              with a curated network of 7,400+ accredited investors, creating opportunities for 
              sustainable wealth building through institutional-quality real estate investments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center group hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Quality Deals</h3>
              <p className="text-gray-600">
                Every syndication opportunity undergoes thorough due diligence and verification 
                before being listed on our platform.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center group hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Elite Network</h3>
              <p className="text-gray-600">
                Access to 7,400+ accredited investors actively seeking commercial real estate 
                investment opportunities.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center group hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">SEC Compliant</h3>
              <p className="text-gray-600">
                Platform built with SEC regulations in mind, ensuring compliant transactions 
                for all parties involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Impact</h2>
            <p className="text-xl text-slate-300">Driving growth in commercial real estate syndication</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-4xl font-bold text-white mb-2">$450M+</div>
              <div className="text-slate-400">Total Deal Volume</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-4xl font-bold text-white mb-2">7,400+</div>
              <div className="text-slate-400">Accredited Investors</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-slate-400">Active Syndications</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-slate-400">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Heart className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex items-start gap-4 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency in all transactions, providing investors 
                  with comprehensive deal information and performance metrics.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex items-start gap-4 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Excellence</h3>
                <p className="text-gray-600">
                  We maintain the highest standards for both syndicators and investment 
                  opportunities featured on our platform.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex items-start gap-4 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Integrity</h3>
                <p className="text-gray-600">
                  Every interaction on our platform is guided by integrity, ensuring fair 
                  and ethical business practices for all participants.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex items-start gap-4 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Community</h3>
                <p className="text-gray-600">
                  Building a strong community of investors and syndicators who support 
                  each other's success in commercial real estate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Join Our Community?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Whether you're an investor or syndicator, EquityMD provides the tools and network 
                you need to succeed in commercial real estate.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  to="/find"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition border border-white/30"
                >
                  Browse Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Schema.org markup for SEO */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-3xl mx-auto px-4">
          <FAQSection 
            title="Questions About EquityMD"
            faqs={aboutFaqs}
          />
        </div>
      </section>

      <Footer />
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
