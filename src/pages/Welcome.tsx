import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  TrendingUp, Building2, ArrowRight, ArrowLeft, Check, 
  DollarSign, MapPin, Target, Briefcase, Users, Sparkles,
  ChevronRight, Camera, Globe, Zap
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={`h-2 rounded-full transition-all duration-500 ${
          i < currentStep 
            ? 'bg-blue-600 w-8' 
            : i === currentStep 
            ? 'bg-blue-600 w-12' 
            : 'bg-gray-200 w-8'
        }`}
      />
    ))}
  </div>
);

// Confetti component
const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {[...Array(60)].map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: '-20px',
          animation: `confetti-fall ${3 + Math.random() * 2}s linear forwards`,
          animationDelay: `${Math.random() * 1}s`,
        }}
      >
        <div
          className="w-3 h-3"
          style={{
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 6)],
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      </div>
    ))}
    <style>{`
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `}</style>
  </div>
);

// Investment range options
const INVESTMENT_RANGES = [
  { value: '25000-50000', label: '$25K - $50K', icon: '💵' },
  { value: '50000-100000', label: '$50K - $100K', icon: '💰' },
  { value: '100000-250000', label: '$100K - $250K', icon: '💎' },
  { value: '250000-500000', label: '$250K - $500K', icon: '🏆' },
  { value: '500000+', label: '$500K+', icon: '👑' },
];

// Property types
const PROPERTY_TYPES = [
  { value: 'multifamily', label: 'Multifamily', icon: '🏢' },
  { value: 'office', label: 'Office', icon: '🏛️' },
  { value: 'retail', label: 'Retail', icon: '🏪' },
  { value: 'industrial', label: 'Industrial', icon: '🏭' },
  { value: 'mixed-use', label: 'Mixed-Use', icon: '🏗️' },
  { value: 'self-storage', label: 'Self-Storage', icon: '📦' },
];

// Markets
const MARKETS = [
  { value: 'texas', label: 'Texas', icon: '🤠' },
  { value: 'florida', label: 'Florida', icon: '🌴' },
  { value: 'arizona', label: 'Arizona', icon: '🌵' },
  { value: 'california', label: 'California', icon: '☀️' },
  { value: 'georgia', label: 'Georgia', icon: '🍑' },
  { value: 'nationwide', label: 'Nationwide', icon: '🇺🇸' },
];

export function Welcome() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'investor' | 'syndicator' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);

  // Investor form data
  const [investorData, setInvestorData] = useState({
    fullName: profile?.full_name || '',
    investmentRange: '',
    propertyTypes: [] as string[],
    markets: [] as string[],
  });

  // Syndicator form data
  const [syndicatorData, setSyndicatorData] = useState({
    fullName: profile?.full_name || '',
    companyName: '',
    companyDescription: '',
  });

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If profile is already complete, redirect to dashboard
  useEffect(() => {
    if (profile?.full_name && profile?.user_type) {
      // Check if they've completed onboarding
      const checkOnboarding = async () => {
        if (profile.user_type === 'investor') {
          const { data } = await supabase
            .from('investor_profiles')
            .select('investment_range_min')
            .eq('id', user.id)
            .single();
          
          if (data?.investment_range_min) {
            navigate('/dashboard');
          }
        } else if (profile.user_type === 'syndicator') {
          const { data } = await supabase
            .from('syndicators')
            .select('id')
            .eq('claimed_by', user.id)
            .single();
          
          if (data) {
            navigate('/dashboard');
          }
        }
      };
      checkOnboarding();
    }
  }, [profile, user, navigate]);

  const handleRoleSelect = (role: 'investor' | 'syndicator') => {
    setSelectedRole(role);
    setStep(1);
  };

  const handleInvestorComplete = async () => {
    setSaving(true);
    try {
      // Update profile
      await supabase
        .from('profiles')
        .update({
          full_name: investorData.fullName,
          user_type: 'investor',
        })
        .eq('id', user.id);

      // Parse investment range
      const [min, max] = investorData.investmentRange.split('-').map(v => 
        v.replace('+', '').replace('$', '').replace('K', '000').replace(',', '')
      );

      // Update investor profile
      await supabase
        .from('investor_profiles')
        .upsert({
          id: user.id,
          investment_range_min: parseInt(min) || 25000,
          investment_range_max: max ? parseInt(max) : 10000000,
          preferred_property_types: investorData.propertyTypes,
          preferred_locations: investorData.markets,
          accredited_status: true,
        });

      setShowConfetti(true);
      setStep(4); // Success step

      // Redirect after celebration
      setTimeout(() => {
        navigate('/deals');
      }, 3000);

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyndicatorComplete = async () => {
    setSaving(true);
    try {
      // Update profile
      await supabase
        .from('profiles')
        .update({
          full_name: syndicatorData.fullName,
          user_type: 'syndicator',
        })
        .eq('id', user.id);

      // Create syndicator profile
      const slug = syndicatorData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await supabase
        .from('syndicators')
        .insert({
          company_name: syndicatorData.companyName,
          company_description: syndicatorData.companyDescription,
          slug: `${slug}-${Date.now().toString(36)}`,
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
          claimable: false,
          verification_status: 'unverified',
        });

      setShowConfetti(true);
      setStep(4); // Success step

      // Redirect after celebration
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  // Calculate total steps based on role
  const totalSteps = selectedRole === 'investor' ? 4 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {showConfetti && <Confetti />}
      
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Equity<span className="text-blue-400">MD</span>
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step 0: Role Selection */}
          {step === 0 && (
            <div className="p-8 lg:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Welcome to EquityMD! 🎉
                </h2>
                <p className="text-lg text-gray-600">
                  What brings you here today?
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Investor Option */}
                <button
                  onClick={() => handleRoleSelect('investor')}
                  className="group relative p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all text-left"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    I Want to Invest
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Browse exclusive real estate syndication deals from vetted sponsors
                  </p>
                  <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </button>

                {/* Syndicator Option */}
                <button
                  onClick={() => handleRoleSelect('syndicator')}
                  className="group relative p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all text-left"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    I Have Deals to List
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Connect with accredited investors looking for opportunities
                  </p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* INVESTOR FLOW */}
          {selectedRole === 'investor' && step >= 1 && step <= 3 && (
            <div className="p-8 lg:p-12">
              <StepIndicator currentStep={step} totalSteps={totalSteps} />

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Let's get to know you! 👋
                    </h2>
                    <p className="text-gray-600">This helps us personalize your experience</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={investorData.fullName}
                        onChange={(e) => setInvestorData({ ...investorData, fullName: e.target.value })}
                        placeholder="John Smith"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-lg"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Typical Investment Size
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {INVESTMENT_RANGES.map((range) => (
                          <button
                            key={range.value}
                            onClick={() => setInvestorData({ ...investorData, investmentRange: range.value })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              investorData.investmentRange === range.value
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-2xl">{range.icon}</span>
                            <p className="font-semibold text-gray-900 mt-1">{range.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setStep(0)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!investorData.fullName || !investorData.investmentRange}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Property Types */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      What property types interest you? 🏢
                    </h2>
                    <p className="text-gray-600">Select all that apply</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => toggleArrayItem(
                          investorData.propertyTypes, 
                          type.value, 
                          (arr) => setInvestorData({ ...investorData, propertyTypes: arr })
                        )}
                        className={`p-5 rounded-xl border-2 text-center transition-all ${
                          investorData.propertyTypes.includes(type.value)
                            ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-3xl">{type.icon}</span>
                        <p className="font-semibold text-gray-900 mt-2">{type.label}</p>
                        {investorData.propertyTypes.includes(type.value) && (
                          <Check className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={investorData.propertyTypes.length === 0}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Markets */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Which markets are you interested in? 📍
                    </h2>
                    <p className="text-gray-600">Select all that apply</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {MARKETS.map((market) => (
                      <button
                        key={market.value}
                        onClick={() => toggleArrayItem(
                          investorData.markets, 
                          market.value, 
                          (arr) => setInvestorData({ ...investorData, markets: arr })
                        )}
                        className={`p-5 rounded-xl border-2 text-center transition-all ${
                          investorData.markets.includes(market.value)
                            ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-3xl">{market.icon}</span>
                        <p className="font-semibold text-gray-900 mt-2">{market.label}</p>
                        {investorData.markets.includes(market.value) && (
                          <Check className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      onClick={handleInvestorComplete}
                      disabled={investorData.markets.length === 0 || saving}
                      className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Complete Setup <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SYNDICATOR FLOW */}
          {selectedRole === 'syndicator' && step >= 1 && step <= 2 && (
            <div className="p-8 lg:p-12">
              <StepIndicator currentStep={step} totalSteps={totalSteps} />

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Tell us about you! 👋
                    </h2>
                    <p className="text-gray-600">This helps investors know who they're working with</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={syndicatorData.fullName}
                        onChange={(e) => setSyndicatorData({ ...syndicatorData, fullName: e.target.value })}
                        placeholder="John Smith"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-lg"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company / Entity Name
                      </label>
                      <input
                        type="text"
                        value={syndicatorData.companyName}
                        onChange={(e) => setSyndicatorData({ ...syndicatorData, companyName: e.target.value })}
                        placeholder="Acme Real Estate Partners LLC"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setStep(0)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!syndicatorData.fullName || !syndicatorData.companyName}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Company Description */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Describe your company 🏢
                    </h2>
                    <p className="text-gray-600">Help investors understand what makes you unique</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea
                      value={syndicatorData.companyDescription}
                      onChange={(e) => setSyndicatorData({ ...syndicatorData, companyDescription: e.target.value })}
                      placeholder="Tell investors about your company, experience, and investment philosophy..."
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      💡 Tip: Mention your years of experience, number of deals, and investment focus
                    </p>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      onClick={handleSyndicatorComplete}
                      disabled={!syndicatorData.companyDescription || saving}
                      className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Complete Setup <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 4 && (
            <div className="p-8 lg:p-12 text-center">
              <div className="animate-bounce mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full">
                  <Check className="h-10 w-10 text-emerald-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                You're All Set! 🎉
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                {selectedRole === 'investor' 
                  ? "Your profile is ready. Let's find you some amazing deals!"
                  : "Your company profile is live. Time to list your first deal!"
                }
              </p>

              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting you now...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Fade-in animation */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

