import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { Search, CheckCircle, DollarSign, TrendingUp, Building2, Shield, Users, ArrowRight, Star, Clock, Award, Trophy, Zap, Target, Flame, Lock, Sparkles } from 'lucide-react';

export function HowItWorks() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const steps = [
    {
      icon: <Search className="h-10 w-10 text-white" />,
      title: "Discover Opportunities",
      description: "Browse our carefully curated selection of institutional-quality real estate investments with detailed analytics and projections.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: <Shield className="h-10 w-10 text-white" />,
      title: "Quick Verification",
      description: "Complete our streamlined accreditation process in minutes to unlock exclusive investment opportunities.",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      icon: <Building2 className="h-10 w-10 text-white" />,
      title: "Deep Due Diligence",
      description: "Access comprehensive property analysis, market research, and financial projections from our expert team.",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: <DollarSign className="h-10 w-10 text-white" />,
      title: "Invest",
      description: "Complete your investment in working with the Syndicator of your choice for as little as $25,000.",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-16 w-16 text-blue-600" />,
      title: "Institutional-Grade Assets",
      description: "Access premium real estate investments typically reserved for large institutions and ultra-high-net-worth individuals.",
      stats: "15-25% Target IRR"
    },
    {
      icon: <Shield className="h-16 w-16 text-green-600" />,
      title: "Rigorous Vetting Process",
      description: "Every opportunity undergoes comprehensive due diligence by our experienced real estate professionals.",
      stats: "< 5% Approval Rate"
    },
    {
      icon: <Users className="h-16 w-16 text-purple-600" />,
      title: "Proven Track Record",
      description: "Partner with seasoned operators who have successfully managed billions in real estate assets.",
      stats: "$2B+ Assets Managed"
    }
  ];

  const features = [
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Passive Income",
      description: "Earn quarterly distributions without the hassles of property management"
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Tax Advantages",
      description: "Benefit from depreciation and other real estate tax benefits"
    },
    {
      icon: <Star className="h-8 w-8 text-blue-600" />,
      title: "Portfolio Diversification",
      description: "Reduce risk by diversifying beyond traditional stocks and bonds"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How <span className="text-blue-300">EquityMD</span> Works
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your gateway to institutional-quality real estate investments. 
              Build wealth through passive real estate ownership.
            </p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-200">20+</div>
                <div className="text-blue-100">Syndicators</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-200">10,000+</div>
                <div className="text-blue-100">Investors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-200">18.5%</div>
                <div className="text-blue-100">Average IRR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EquityMD Commercial Video Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Unlock Wealth
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How EquityMD Empowers Investors with Premium Real Estate Opportunities
            </p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
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
            <script src="https://player.vimeo.com/api/player.js"></script>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start building your real estate portfolio in minutes, not months
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6`}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose EquityMD?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide access to premium real estate investments with institutional-level due diligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                  {benefit.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Investment Advantages
            </h2>
            <p className="text-xl text-gray-600">
              Maximize your returns while minimizing your effort
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold ml-3 text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="text-amber-300 font-medium">Your Journey, Gamified</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Earn Achievements. Level Up. Build Wealth.
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Track your progress, unlock badges, and level up as you build your real estate portfolio on EquityMD.
            </p>
          </div>

          {/* Two-column layout for Investor & Syndicator */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Investor Journey */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Investor Journey</h3>
                  <p className="text-slate-400 text-sm">Your path to building wealth</p>
                </div>
              </div>

              {/* Investor Levels */}
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-3">Level Progression</p>
                <div className="flex items-center gap-2">
                  {[
                    { level: 1, icon: '🌱', title: 'Newcomer' },
                    { level: 2, icon: '🔍', title: 'Explorer' },
                    { level: 3, icon: '📈', title: 'Active' },
                    { level: 4, icon: '💎', title: 'Seasoned' },
                    { level: 5, icon: '👑', title: 'Elite' },
                  ].map((level) => (
                    <div 
                      key={level.level}
                      className="flex-1 text-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-default group"
                      title={level.title}
                    >
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{level.icon}</div>
                      <div className="text-xs text-slate-500">Lvl {level.level}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Investor Achievements */}
              <div>
                <p className="text-sm text-slate-400 mb-3">Sample Achievements</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: '🎯', title: 'First Steps', rarity: 'common', unlocked: true },
                    { icon: '📸', title: 'Picture Perfect', rarity: 'common', unlocked: true },
                    { icon: '❤️', title: 'Heart Eyes', rarity: 'common', unlocked: true },
                    { icon: '🤝', title: 'Interested Party', rarity: 'uncommon', unlocked: false },
                    { icon: '💬', title: 'Conversation Starter', rarity: 'uncommon', unlocked: false },
                    { icon: '💰', title: 'Making Moves', rarity: 'rare', unlocked: false },
                    { icon: '🏆', title: 'Accredited', rarity: 'epic', unlocked: false },
                    { icon: '🚀', title: 'Early Adopter', rarity: 'epic', unlocked: false },
                  ].map((achievement, idx) => (
                    <div 
                      key={idx}
                      className={`relative group cursor-default ${!achievement.unlocked ? 'opacity-40 grayscale' : ''}`}
                      title={achievement.title}
                    >
                      <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl ${
                        achievement.rarity === 'common' ? 'bg-gray-700/50' :
                        achievement.rarity === 'uncommon' ? 'bg-emerald-900/50' :
                        achievement.rarity === 'rare' ? 'bg-blue-900/50' :
                        'bg-purple-900/50'
                      } ${achievement.unlocked ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''} ${
                        achievement.rarity === 'common' && achievement.unlocked ? 'ring-gray-500' :
                        achievement.rarity === 'uncommon' && achievement.unlocked ? 'ring-emerald-500' :
                        achievement.rarity === 'rare' && achievement.unlocked ? 'ring-blue-500' :
                        achievement.unlocked ? 'ring-purple-500' : ''
                      }`}>
                        {achievement.unlocked ? achievement.icon : <Lock className="h-4 w-4 text-slate-600" />}
                      </div>
                      {achievement.unlocked && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Syndicator Journey */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Syndicator Journey</h3>
                  <p className="text-slate-400 text-sm">Grow your investor network</p>
                </div>
              </div>

              {/* Syndicator Levels */}
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-3">Level Progression</p>
                <div className="flex items-center gap-2">
                  {[
                    { level: 1, icon: '🌱', title: 'New' },
                    { level: 2, icon: '📊', title: 'Growing' },
                    { level: 3, icon: '🏢', title: 'Established' },
                    { level: 4, icon: '⭐', title: 'Top' },
                    { level: 5, icon: '👑', title: 'Master' },
                  ].map((level) => (
                    <div 
                      key={level.level}
                      className="flex-1 text-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-default group"
                      title={level.title}
                    >
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{level.icon}</div>
                      <div className="text-xs text-slate-500">Lvl {level.level}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Syndicator Achievements */}
              <div>
                <p className="text-sm text-slate-400 mb-3">Sample Achievements</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: '🏢', title: 'Brand Identity', rarity: 'common', unlocked: true },
                    { icon: '🌐', title: 'Web Presence', rarity: 'common', unlocked: true },
                    { icon: '🏠', title: 'First Listing', rarity: 'uncommon', unlocked: true },
                    { icon: '📢', title: 'Live Deal', rarity: 'rare', unlocked: false },
                    { icon: '👁️', title: 'Catching Eyes', rarity: 'uncommon', unlocked: false },
                    { icon: '🔥', title: 'In Demand', rarity: 'rare', unlocked: false },
                    { icon: '💰', title: 'Deal Maker', rarity: 'epic', unlocked: false },
                    { icon: '🏆', title: '$1M Club', rarity: 'legendary', unlocked: false },
                  ].map((achievement, idx) => (
                    <div 
                      key={idx}
                      className={`relative group cursor-default ${!achievement.unlocked ? 'opacity-40 grayscale' : ''}`}
                      title={achievement.title}
                    >
                      <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl ${
                        achievement.rarity === 'common' ? 'bg-gray-700/50' :
                        achievement.rarity === 'uncommon' ? 'bg-emerald-900/50' :
                        achievement.rarity === 'rare' ? 'bg-blue-900/50' :
                        achievement.rarity === 'epic' ? 'bg-purple-900/50' :
                        'bg-amber-900/50'
                      } ${achievement.unlocked ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''} ${
                        achievement.rarity === 'common' && achievement.unlocked ? 'ring-gray-500' :
                        achievement.rarity === 'uncommon' && achievement.unlocked ? 'ring-emerald-500' :
                        achievement.rarity === 'rare' && achievement.unlocked ? 'ring-blue-500' :
                        achievement.rarity === 'epic' && achievement.unlocked ? 'ring-purple-500' :
                        achievement.unlocked ? 'ring-amber-500' : ''
                      }`}>
                        {achievement.unlocked ? achievement.icon : <Lock className="h-4 w-4 text-slate-600" />}
                      </div>
                      {achievement.unlocked && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Points & Progress Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Earn Points</h4>
                  <p className="text-sm text-slate-400">Every action counts</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Complete your profile, save deals, express interest, and more to earn points and level up.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Unlock Badges</h4>
                  <p className="text-sm text-slate-400">From Common to Legendary</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Achievements come in 5 rarities. Can you unlock them all and showcase your expertise?
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Build Streaks</h4>
                  <p className="text-sm text-slate-400">Stay engaged, earn more</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Log in daily to build your streak and unlock special "Committed" achievements.
              </p>
            </div>
          </div>

          {/* Sample Next Steps */}
          <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-white" />
              <div>
                <h3 className="text-xl font-bold">Guided Next Steps</h3>
                <p className="text-indigo-200">We'll show you exactly what to do next</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '👤', title: 'Complete Your Profile', points: 50, completed: true },
                { icon: '✓', title: 'Verify Accreditation', points: 100, completed: false },
                { icon: '🏠', title: 'Browse Opportunities', points: 25, completed: false },
              ].map((step, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    step.completed 
                      ? 'bg-white/10 border border-white/10' 
                      : 'bg-white/5 border border-dashed border-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    step.completed ? 'bg-emerald-500' : 'bg-white/10'
                  }`}>
                    {step.completed ? <CheckCircle className="h-6 w-6 text-white" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? 'text-emerald-300 line-through' : 'text-white'}`}>
                      {step.title}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-indigo-300">
                      <Zap className="h-3 w-3" />
                      <span>+{step.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real Estate Education */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Understanding Real Estate Syndication
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Real estate syndication allows multiple investors to pool their capital and invest in larger, 
                more profitable properties that would be difficult to acquire individually.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Pooled Capital Power</h4>
                    <p className="text-gray-600">Access institutional-quality properties with better economies of scale</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Professional Management</h4>
                    <p className="text-gray-600">Experienced operators handle acquisition, management, and disposition</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Passive Investment</h4>
                    <p className="text-gray-600">Enjoy real estate ownership benefits without active management responsibilities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Structure</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Minimum Investment</span>
                    <span className="text-blue-600 font-bold">$25,000</span>
                  </div>
                  <p className="text-gray-600 text-sm">Lower minimums than traditional real estate</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Investment Term</span>
                    <span className="text-blue-600 font-bold">3-7 Years</span>
                  </div>
                  <p className="text-gray-600 text-sm">Medium-term investment horizon</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Expected Returns</span>
                    <span className="text-blue-600 font-bold">15-25% IRR</span>
                  </div>
                  <p className="text-gray-600 text-sm">Cash flow + appreciation at sale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Building Wealth?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of investors who are building their real estate portfolios with EquityMD. 
            Start with as little as $25,000.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/find"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              Browse Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors border-2 border-blue-400"
            >
              Get Started
            </button>
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