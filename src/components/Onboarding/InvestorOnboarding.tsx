import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Check, Loader2, TrendingUp,
  Shield, DollarSign, MapPin, Target, User, Mail, Lock,
  Building2, Briefcase, Clock, AlertCircle, Eye, EyeOff,
  CheckCircle, Sparkles, Home
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const INVESTMENT_RANGES = [
  { value: '25000', label: '$25,000 - $50,000', min: 25000, max: 50000 },
  { value: '50000', label: '$50,000 - $100,000', min: 50000, max: 100000 },
  { value: '100000', label: '$100,000 - $250,000', min: 100000, max: 250000 },
  { value: '250000', label: '$250,000 - $500,000', min: 250000, max: 500000 },
  { value: '500000', label: '$500,000+', min: 500000, max: null },
];

const PROPERTY_TYPES = [
  { value: 'Multi-Family', label: 'Multi-Family', icon: '🏢' },
  { value: 'Office', label: 'Office', icon: '🏬' },
  { value: 'Retail', label: 'Retail', icon: '🏪' },
  { value: 'Industrial', label: 'Industrial', icon: '🏭' },
  { value: 'Medical', label: 'Medical', icon: '🏥' },
  { value: 'Hospitality', label: 'Hospitality', icon: '🏨' },
];

const INVESTMENT_GOALS = [
  { value: 'passive_income', label: 'Passive Income', description: 'Regular cash distributions', icon: DollarSign },
  { value: 'appreciation', label: 'Appreciation', description: 'Long-term value growth', icon: TrendingUp },
  { value: 'tax_benefits', label: 'Tax Benefits', description: 'Depreciation & deductions', icon: Shield },
  { value: 'diversification', label: 'Diversification', description: 'Portfolio variety', icon: Briefcase },
];

const RISK_LEVELS = [
  { value: 'conservative', label: 'Conservative', description: 'Lower risk, steady returns', color: 'emerald' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced risk and reward', color: 'blue' },
  { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential', color: 'purple' },
];

interface FormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  accreditedStatus: 'yes' | 'no' | 'not_sure' | '';
  investmentRange: string;
  propertyTypes: string[];
  investmentGoals: string[];
  riskTolerance: string;
  preferredLocations: string[];
}

export function InvestorOnboarding() {
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
    accreditedStatus: '',
    investmentRange: '',
    propertyTypes: [],
    investmentGoals: [],
    riskTolerance: '',
    preferredLocations: [],
  });

  const steps = [
    { id: 'account', title: 'Create Account', icon: User },
    { id: 'accreditation', title: 'Accreditation', icon: Shield },
    { id: 'preferences', title: 'Preferences', icon: Target },
    { id: 'complete', title: 'All Set!', icon: CheckCircle },
  ];

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError('');
  };

  const toggleArrayItem = (field: 'propertyTypes' | 'investmentGoals' | 'preferredLocations', value: string) => {
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
        if (!formData.accreditedStatus) {
          setError('Please select your accreditation status');
          return false;
        }
        return true;
      case 2:
        // Preferences are optional
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
            user_type: 'investor',
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
          user_type: 'investor',
          is_verified: true,
        });

      if (profileError) throw profileError;

      // Create investor profile
      const { error: investorError } = await supabase
        .from('investor_profiles')
        .insert({
          id: user.id,
          accredited_status: formData.accreditedStatus === 'yes',
          minimum_investment: formData.investmentRange ? parseInt(formData.investmentRange) : null,
          preferred_property_types: formData.propertyTypes,
          investment_goals: formData.investmentGoals.join(', '),
          risk_tolerance: formData.riskTolerance,
          preferred_locations: formData.preferredLocations,
        });

      if (investorError) console.error('Investor profile error:', investorError);

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
      // Final step - create account
      await handleCreateAccount();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
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
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-semibold">Investor Account</span>
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
                    ? 'bg-blue-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {index < currentStep ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${
                  index <= currentStep ? 'text-blue-400' : 'text-slate-500'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${
                  index < currentStep ? 'bg-blue-500' : 'bg-slate-700'
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
                <h2 className="text-2xl font-bold text-white mb-2">Create Your Investor Account</h2>
                <p className="text-slate-400">Let's get you set up to explore investment opportunities</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateFormData({ fullName: e.target.value })}
                      placeholder="John Smith"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                      className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 1: Accreditation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Accreditation Status</h2>
                <p className="text-slate-400">Real estate syndications typically require accredited investors</p>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-300">Are you an accredited investor?</p>
                
                <div className="space-y-3">
                  {[
                    { value: 'yes', label: 'Yes, I am accredited', description: 'I meet SEC accreditation requirements' },
                    { value: 'no', label: 'No, I am not accredited', description: 'I don\'t currently meet the requirements' },
                    { value: 'not_sure', label: 'I\'m not sure', description: 'I need to learn more about accreditation' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFormData({ accreditedStatus: option.value as any })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.accreditedStatus === option.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${formData.accreditedStatus === option.value ? 'text-blue-400' : 'text-white'}`}>
                            {option.label}
                          </p>
                          <p className="text-sm text-slate-400">{option.description}</p>
                        </div>
                        {formData.accreditedStatus === option.value && (
                          <Check className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {formData.accreditedStatus === 'not_sure' && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-300">
                      <strong>Accredited Investor Criteria:</strong>
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-200">
                      <li>• Net worth over $1 million (excluding primary residence)</li>
                      <li>• Income over $200K ($300K joint) for last 2 years</li>
                      <li>• Certain professional certifications (Series 7, 65, 82)</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Investment Preferences</h2>
                <p className="text-slate-400">Help us personalize your experience (optional)</p>
              </div>
              
              {/* Investment Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Typical Investment Amount
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {INVESTMENT_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => updateFormData({ investmentRange: range.value })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.investmentRange === range.value
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Property Types */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Property Types of Interest
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleArrayItem('propertyTypes', type.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        formData.propertyTypes.includes(type.value)
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{type.icon}</span>
                      <span className={`text-xs font-medium ${
                        formData.propertyTypes.includes(type.value) ? 'text-blue-400' : 'text-slate-300'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Risk Tolerance */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Risk Tolerance
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {RISK_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => updateFormData({ riskTolerance: level.value })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.riskTolerance === level.value
                          ? `border-${level.color}-500 bg-${level.color}-500/10`
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <p className={`font-medium ${
                        formData.riskTolerance === level.value ? `text-${level.color}-400` : 'text-white'
                      }`}>
                        {level.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{level.description}</p>
                    </button>
                  ))}
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
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to EquityMD!</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Your investor account is ready. Start exploring investment opportunities and connect with top syndicators.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/browse')}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="h-5 w-5 inline mr-2" />
                  Browse Investment Opportunities
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
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
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

