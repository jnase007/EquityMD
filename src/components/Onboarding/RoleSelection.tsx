import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Building2, ArrowRight, Check, Sparkles, 
  Shield, Users, DollarSign, BarChart3, Home, Briefcase,
  Star, Award, Target, Zap
} from 'lucide-react';

interface RoleSelectionProps {
  onSelect?: (role: 'investor' | 'syndicator') => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState<'investor' | 'syndicator' | null>(null);
  const [selectedRole, setSelectedRole] = useState<'investor' | 'syndicator' | null>(null);

  const handleSelect = (role: 'investor' | 'syndicator') => {
    setSelectedRole(role);
    
    // Store selection
    sessionStorage.setItem('signup_type', role);
    
    if (onSelect) {
      onSelect(role);
    }
    
    // Navigate to role-specific onboarding after animation
    setTimeout(() => {
      navigate(`/signup/${role}/email`);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Logo */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <Home className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">EquityMD</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Welcome to EquityMD
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How will you use EquityMD?
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Choose your path to get a personalized experience. This helps us show you the right features and content.
            </p>
          </div>
          
          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Investor Card */}
            <button
              onClick={() => handleSelect('investor')}
              onMouseEnter={() => setHoveredRole('investor')}
              onMouseLeave={() => setHoveredRole(null)}
              className={`relative group text-left p-8 rounded-3xl border-2 transition-all duration-500 transform ${
                selectedRole === 'investor'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400 scale-[1.02]'
                  : hoveredRole === 'investor'
                  ? 'bg-white/10 border-blue-400/50 scale-[1.01]'
                  : 'bg-white/5 border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl transition-opacity duration-500 ${
                hoveredRole === 'investor' || selectedRole === 'investor' ? 'opacity-100' : 'opacity-0'
              }`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  selectedRole === 'investor' 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 group-hover:from-blue-500/30 group-hover:to-indigo-500/30'
                }`}>
                  <TrendingUp className={`h-8 w-8 ${selectedRole === 'investor' ? 'text-white' : 'text-blue-400'}`} />
                </div>
                
                {/* Title */}
                <h2 className={`text-2xl font-bold mb-2 ${selectedRole === 'investor' ? 'text-white' : 'text-white'}`}>
                  I'm an Investor
                </h2>
                <p className={`text-base mb-6 ${selectedRole === 'investor' ? 'text-blue-100' : 'text-slate-400'}`}>
                  I want to discover and invest in real estate syndication deals
                </p>
                
                {/* Features */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: BarChart3, text: 'Browse vetted investment opportunities' },
                    { icon: Shield, text: 'Accredited investor verification' },
                    { icon: DollarSign, text: 'Track your portfolio performance' },
                    { icon: Users, text: 'Connect directly with syndicators' },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedRole === 'investor' ? 'bg-white/20' : 'bg-blue-500/10'
                      }`}>
                        <Icon className={`h-3 w-3 ${selectedRole === 'investor' ? 'text-white' : 'text-blue-400'}`} />
                      </div>
                      <span className={`text-sm ${selectedRole === 'investor' ? 'text-blue-100' : 'text-slate-300'}`}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                <div className={`flex items-center gap-2 font-semibold transition-colors ${
                  selectedRole === 'investor' ? 'text-white' : 'text-blue-400 group-hover:text-blue-300'
                }`}>
                  {selectedRole === 'investor' ? (
                    <>
                      <Check className="h-5 w-5" />
                      Selected
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </div>
              
              {/* Best For Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedRole === 'investor' ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400'
              }`}>
                Most Popular
              </div>
            </button>
            
            {/* Syndicator Card */}
            <button
              onClick={() => handleSelect('syndicator')}
              onMouseEnter={() => setHoveredRole('syndicator')}
              onMouseLeave={() => setHoveredRole(null)}
              className={`relative group text-left p-8 rounded-3xl border-2 transition-all duration-500 transform ${
                selectedRole === 'syndicator'
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400 scale-[1.02]'
                  : hoveredRole === 'syndicator'
                  ? 'bg-white/10 border-emerald-400/50 scale-[1.01]'
                  : 'bg-white/5 border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-xl transition-opacity duration-500 ${
                hoveredRole === 'syndicator' || selectedRole === 'syndicator' ? 'opacity-100' : 'opacity-0'
              }`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  selectedRole === 'syndicator' 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/30 group-hover:to-teal-500/30'
                }`}>
                  <Building2 className={`h-8 w-8 ${selectedRole === 'syndicator' ? 'text-white' : 'text-emerald-400'}`} />
                </div>
                
                {/* Title */}
                <h2 className={`text-2xl font-bold mb-2 ${selectedRole === 'syndicator' ? 'text-white' : 'text-white'}`}>
                  I'm a Syndicator
                </h2>
                <p className={`text-base mb-6 ${selectedRole === 'syndicator' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  I want to list deals and connect with accredited investors
                </p>
                
                {/* Features */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: Briefcase, text: 'List your investment opportunities' },
                    { icon: Target, text: 'Reach qualified, accredited investors' },
                    { icon: Award, text: 'Build your reputation with reviews' },
                    { icon: Zap, text: 'Streamlined investor communications' },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedRole === 'syndicator' ? 'bg-white/20' : 'bg-emerald-500/10'
                      }`}>
                        <Icon className={`h-3 w-3 ${selectedRole === 'syndicator' ? 'text-white' : 'text-emerald-400'}`} />
                      </div>
                      <span className={`text-sm ${selectedRole === 'syndicator' ? 'text-emerald-100' : 'text-slate-300'}`}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                <div className={`flex items-center gap-2 font-semibold transition-colors ${
                  selectedRole === 'syndicator' ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'
                }`}>
                  {selectedRole === 'syndicator' ? (
                    <>
                      <Check className="h-5 w-5" />
                      Selected
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </div>
              
              {/* Pro Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedRole === 'syndicator' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                <Star className="h-3 w-3 inline mr-1" />
                Pro
              </div>
            </button>
          </div>
          
          {/* Already have account */}
          <div className="text-center mt-12">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/')}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Bank-level security
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              SEC compliant
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              1,000+ active investors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

