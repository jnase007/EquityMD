import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { Search, CheckCircle, DollarSign, TrendingUp, Building2, Shield, Users, ArrowRight, Star, Clock, Award, Trophy, Zap, Target, Flame, Lock, Sparkles, Play } from 'lucide-react';

export function HowItWorks() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const steps = [
    {
      icon: <Search className="h-8 w-8 text-white" />,
      title: "Discover Opportunities",
      description: "Browse our carefully curated selection of institutional-quality real estate investments.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Quick Verification",
      description: "Complete our streamlined accreditation process in minutes.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Building2 className="h-8 w-8 text-white" />,
      title: "Deep Due Diligence",
      description: "Access comprehensive property analysis and financial projections.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-white" />,
      title: "Invest",
      description: "Complete your investment with the Syndicator of your choice.",
      gradient: "from-amber-500 to-orange-600"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Institutional-Grade Assets",
      description: "Access premium real estate investments typically reserved for large institutions.",
      stats: "15-25% Target IRR",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Rigorous Vetting Process",
      description: "Every opportunity undergoes comprehensive due diligence by our team.",
      stats: "< 5% Approval Rate",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Proven Track Record",
      description: "Partner with seasoned operators who have managed billions in assets.",
      stats: "$2B+ Assets Managed",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Passive Income",
      description: "Earn quarterly distributions without property management hassles",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Tax Advantages",
      description: "Benefit from depreciation and real estate tax benefits",
      color: "text-emerald-600 bg-emerald-100"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Portfolio Diversification",
      description: "Reduce risk by diversifying beyond stocks and bonds",
      color: "text-purple-600 bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl" />
        
        {/* Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Your Gateway to Real Estate Wealth</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              How <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">EquityMD</span> Works
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Build wealth through passive real estate ownership. Access institutional-quality investments with as little as $25,000.
            </p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-2xl sm:text-3xl font-bold text-white">20+</div>
                <div className="text-blue-200 text-sm">Syndicators</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-2xl sm:text-3xl font-bold text-white">10K+</div>
                <div className="text-blue-200 text-sm">Investors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-2xl sm:text-3xl font-bold text-white">18.5%</div>
                <div className="text-blue-200 text-sm">Avg IRR</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Video Section */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Play className="h-4 w-4" />
              Watch Video
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Unlock Wealth with EquityMD
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how we empower investors with premium real estate opportunities
            </p>
          </div>
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-200">
            <div style={{padding:'56.25% 0 0 0',position:'relative'}}>
              <iframe 
                src="https://player.vimeo.com/video/1109385630?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;dnt=1" 
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} 
                title="EquityMD Commercial"
              />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              <Target className="h-4 w-4" />
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              4 Steps to Your First Investment
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start building your real estate portfolio in minutes, not months
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full border border-gray-100">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The EquityMD Advantage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Premium real estate investments with institutional-level due diligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-8 h-full border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl font-semibold text-gray-900 shadow-sm border border-gray-200">
                    <Zap className="h-4 w-4 text-amber-500" />
                    {benefit.stats}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium mb-4 border border-white/20">
              <Trophy className="h-4 w-4 text-yellow-300" />
              Investment Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Maximize Returns, Minimize Effort
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Enjoy the benefits of real estate ownership without the headaches
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20 mb-6">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-white font-medium">Your Journey, Gamified</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Earn Achievements. Level Up. Build Wealth.
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Track your progress, unlock badges, and level up as you build your portfolio
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Investor Journey */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Investor Journey</h3>
                  <p className="text-white/60 text-sm">Your path to building wealth</p>
                </div>
              </div>

              {/* Levels */}
              <div className="mb-6">
                <p className="text-sm text-white/60 mb-3">Level Progression</p>
                <div className="flex items-center gap-2">
                  {['🌱', '🔍', '📈', '💎', '👑'].map((icon, i) => (
                    <div key={i} className="flex-1 text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-xs text-white/50">Lvl {i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="grid grid-cols-4 gap-3">
                {['🎯', '📸', '❤️', '🤝', '💬', '💰', '🏆', '🚀'].map((icon, i) => (
                  <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${i < 3 ? 'bg-white/20 ring-2 ring-white/30' : 'bg-white/5 opacity-50'}`}>
                    {i < 3 ? icon : <Lock className="h-4 w-4 text-white/30" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Syndicator Journey */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Syndicator Journey</h3>
                  <p className="text-white/60 text-sm">Grow your investor network</p>
                </div>
              </div>

              {/* Levels */}
              <div className="mb-6">
                <p className="text-sm text-white/60 mb-3">Level Progression</p>
                <div className="flex items-center gap-2">
                  {['🌱', '📊', '🏢', '⭐', '👑'].map((icon, i) => (
                    <div key={i} className="flex-1 text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-xs text-white/50">Lvl {i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="grid grid-cols-4 gap-3">
                {['🏢', '🌐', '🏠', '📢', '👁️', '🔥', '💰', '🏆'].map((icon, i) => (
                  <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${i < 3 ? 'bg-white/20 ring-2 ring-white/30' : 'bg-white/5 opacity-50'}`}>
                    {i < 3 ? icon : <Lock className="h-4 w-4 text-white/30" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Earn Points</h4>
                  <p className="text-sm text-white/60">Every action counts</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">Complete your profile, save deals, and more to level up.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Unlock Badges</h4>
                  <p className="text-sm text-white/60">Common to Legendary</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">Achievements come in 5 rarities. Collect them all!</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Build Streaks</h4>
                  <p className="text-sm text-white/60">Stay engaged daily</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">Log in daily to build your streak and earn bonuses.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                Learn More
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Understanding Real Estate Syndication
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Real estate syndication allows multiple investors to pool their capital and invest in larger commercial properties.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'Pooled Capital Power', desc: 'Access institutional-quality properties with better economies of scale' },
                  { title: 'Professional Management', desc: 'Experienced operators handle acquisition, management, and disposition' },
                  { title: 'Passive Investment', desc: 'Enjoy ownership benefits without active management responsibilities' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Structure</h3>
              <div className="space-y-4">
                {[
                  { label: 'Minimum Investment', value: '$25,000', note: 'Lower minimums than traditional real estate' },
                  { label: 'Investment Term', value: '3-7 Years', note: 'Medium-term investment horizon' },
                  { label: 'Typical Target Range*', value: '15-25% IRR', note: '*Varies by deal. Past performance not indicative of future results.' },
                ].map((item, i) => (
                  <div key={i} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="text-blue-600 font-bold text-lg">{item.value}</span>
                    </div>
                    <p className="text-gray-500 text-sm">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20 mb-6">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-white font-medium">Start Your Journey</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Wealth?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of investors building their real estate portfolios. Start with as little as $25,000.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/find"
              className="group bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl inline-flex items-center justify-center gap-2"
            >
              Browse Opportunities
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white/10 backdrop-blur text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/30"
            >
              Get Started Free
            </button>
          </div>
          
          {/* Trust */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              No investor fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Verified syndicators
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              SEC compliant
            </span>
          </div>
        </div>
      </div>

      <Footer />
      
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultType="investor"
          defaultView="sign_up"
        />
      )}
    </div>
  );
}
