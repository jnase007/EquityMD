import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Check, Loader2, Building2,
  User, Mail, Lock, Globe, MapPin, Briefcase, Award,
  AlertCircle, Eye, EyeOff, CheckCircle, Sparkles, 
  DollarSign, Users, Target, TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SPECIALTIES = [
  { value: 'Multi-Family', label: 'Multi-Family', icon: '🏢' },
  { value: 'Office', label: 'Office', icon: '🏬' },
  { value: 'Retail', label: 'Retail', icon: '🏪' },
  { value: 'Industrial', label: 'Industrial', icon: '🏭' },
  { value: 'Medical', label: 'Medical', icon: '🏥' },
  { value: 'Hospitality', label: 'Hospitality', icon: '🏨' },
  { value: 'Mixed-Use', label: 'Mixed-Use', icon: '🏗️' },
  { value: 'Student Housing', label: 'Student Housing', icon: '🎓' },
];

const DEAL_VOLUME_RANGES = [
  { value: 'under_10m', label: 'Under $10M' },
  { value: '10m_50m', label: '$10M - $50M' },
  { value: '50m_100m', label: '$50M - $100M' },
  { value: '100m_500m', label: '$100M - $500M' },
  { value: 'over_500m', label: '$500M+' },
];

const YEARS_OPTIONS = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

interface FormData {
  // Account
  email: string;
  password: string;
  fullName: string;
  phone: string;
  
  // Company
  companyName: string;
  companyDescription: string;
  website: string;
  city: string;
  state: string;
  
  // Experience
  yearsInBusiness: string;
  totalDealVolume: string;
  specialties: string[];
  targetMarkets: string[];
  
  // Minimum Investment
  minInvestment: string;
}

export function SyndicatorOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    email: sessionStorage.getItem('signup_email') || '',
    password: '',
    fullName: '',
    phone: '',
    companyName: '',
    companyDescription: '',
    website: '',
    city: '',
    state: '',
    yearsInBusiness: '',
    totalDealVolume: '',
    specialties: [],
    targetMarkets: [],
    minInvestment: '50000',
  });

  const steps = [
    { id: 'account', title: 'Your Account', icon: User },
    { id: 'company', title: 'Company Info', icon: Building2 },
    { id: 'experience', title: 'Experience', icon: Award },
    { id: 'complete', title: 'All Set!', icon: CheckCircle },
  ];

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError('');
  };

  const toggleArrayItem = (field: 'specialties' | 'targetMarkets', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!formData.email) {
          setError('Email is required');
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (!formData.fullName) {
          setError('Full name is required');
          return false;
        }
        return true;
      case 1:
        if (!formData.companyName) {
          setError('Company name is required');
          return false;
        }
        return true;
      case 2:
        // Experience is optional but encouraged
        return true;
      default:
        return true;
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError('');

    try {
      // Create user account
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'syndicator',
            full_name: formData.fullName,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Failed to create user');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone_number: formData.phone,
          user_type: 'syndicator',
          is_verified: true,
        });

      if (profileError) throw profileError;

      // Create syndicator record (this is the new approach)
      const yearsMap: Record<string, number> = {
        '0-2': 1,
        '3-5': 4,
        '6-10': 8,
        '10+': 15,
      };

      const volumeMap: Record<string, number> = {
        'under_10m': 5000000,
        '10m_50m': 30000000,
        '50m_100m': 75000000,
        '100m_500m': 250000000,
        'over_500m': 750000000,
      };

      const { error: syndicatorError } = await supabase
        .from('syndicators')
        .insert({
          company_name: formData.companyName,
          company_description: formData.companyDescription,
          website_url: formData.website,
          city: formData.city,
          state: formData.state,
          years_in_business: yearsMap[formData.yearsInBusiness] || null,
          total_deal_volume: volumeMap[formData.totalDealVolume] || null,
          specialties: formData.specialties,
          target_markets: formData.targetMarkets,
          min_investment: parseInt(formData.minInvestment) || 50000,
          verification_status: 'unverified',
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
          claimable: false,
        });

      if (syndicatorError) {
        console.error('Syndicator creation error:', syndicatorError);
        // Don't throw - the user account was created successfully
      }

      // Move to completion step
      setCurrentStep(3);

    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (!validateStep()) return;
    
    if (currentStep === 2) {
      await handleCreateAccount();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/signup/start')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-semibold">Syndicator Account</span>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-emerald-500 text-white'
                    : index === currentStep
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {index < currentStep ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${
                  index <= currentStep ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${
                  index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-8">
          {/* Step 0: Account Creation */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                <p className="text-slate-400">Start listing deals and connecting with investors</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateFormData({ fullName: e.target.value })}
                      placeholder="John Smith"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateFormData({ password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData({ phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Company Information</h2>
                <p className="text-slate-400">Tell investors about your company</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateFormData({ companyName: e.target.value })}
                      placeholder="Acme Real Estate Partners"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Description
                  </label>
                  <textarea
                    value={formData.companyDescription}
                    onChange={(e) => updateFormData({ companyDescription: e.target.value })}
                    placeholder="Tell investors about your company's focus, experience, and investment approach..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateFormData({ website: e.target.value })}
                      placeholder="https://www.company.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      placeholder="Los Angeles"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => updateFormData({ state: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    >
                      <option value="">Select state</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Experience</h2>
                <p className="text-slate-400">Help investors understand your track record</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Years in Business
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {YEARS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateFormData({ yearsInBusiness: option.value })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.yearsInBusiness === option.value
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Total Deal Volume
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DEAL_VOLUME_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => updateFormData({ totalDealVolume: range.value })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.totalDealVolume === range.value
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Specialties
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {SPECIALTIES.map((specialty) => (
                      <button
                        key={specialty.value}
                        onClick={() => toggleArrayItem('specialties', specialty.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.specialties.includes(specialty.value)
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-xl block mb-1">{specialty.icon}</span>
                        <span className={`text-xs font-medium ${
                          formData.specialties.includes(specialty.value) ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {specialty.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Minimum Investment per Deal
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.minInvestment}
                      onChange={(e) => updateFormData({ minInvestment: e.target.value })}
                      placeholder="50000"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">You're All Set!</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Your syndicator account is ready. Start listing deals and connect with accredited investors.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <Users className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-300">1,000+ Active Investors</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <Target className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-300">Verified & Accredited</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/deals/new')}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Sparkles className="h-5 w-5 inline mr-2" />
                  Create Your First Listing
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Go to My Dashboard
                </button>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          
          {/* Navigation */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  currentStep === 0
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
              
              <button
                onClick={nextStep}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : currentStep === 2 ? (
                  <>
                    Create Account
                    <Check className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

