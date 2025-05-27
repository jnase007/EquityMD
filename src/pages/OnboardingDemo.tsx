import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  User, 
  Building2, 
  TrendingUp, 
  Shield, 
  Users, 
  DollarSign,
  Star,
  Play,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

export function OnboardingDemo() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState<'investor' | 'syndicator' | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [email, setEmail] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const investorSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to EquityMD',
      description: 'Join thousands of investors building wealth through real estate syndications',
      icon: <Shield className="h-8 w-8" />,
      benefits: [
        'Exclusive vetted investment opportunities',
        'Minimum investments starting at $25,000',
        'Average returns of 15-22% IRR'
      ]
    },
    {
      id: 'benefits',
      title: 'Why Investors Choose EquityMD',
      description: 'Built for busy professionals seeking passive real estate income',
      icon: <TrendingUp className="h-8 w-8" />,
      benefits: [
        'Passive income without property management',
        'Tax advantages and depreciation benefits',
        'Diversification beyond stocks and bonds'
      ]
    },
    {
      id: 'process',
      title: 'Simple 3-Step Process',
      description: 'Start investing in real estate in minutes, not months',
      icon: <CheckCircle className="h-8 w-8" />,
      benefits: [
        '1. Browse vetted investment opportunities',
        '2. Review detailed property analysis',
        '3. Invest securely online'
      ]
    }
  ];

  const syndicatorSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Grow Your Investor Network',
      description: 'Connect with qualified accredited investors ready to invest',
      icon: <Building2 className="h-8 w-8" />,
      benefits: [
        'Access to 10,000+ accredited investors',
        'Average deal size: $2.5M',
        'Faster capital raising cycles'
      ]
    },
    {
      id: 'platform',
      title: 'Professional Deal Management',
      description: 'Everything you need to showcase and manage your deals',
      icon: <Users className="h-8 w-8" />,
      benefits: [
        'Professional deal presentation tools',
        'Investor communication platform',
        'Document management and e-signatures'
      ]
    },
    {
      id: 'success',
      title: 'Proven Track Record',
      description: 'Join successful syndicators already on our platform',
      icon: <Star className="h-8 w-8" />,
      benefits: [
        '$500M+ in deals funded',
        'Average time to funding: 45 days',
        'Dedicated support team'
      ]
    }
  ];

  const currentSteps = selectedUserType === 'investor' ? investorSteps : syndicatorSteps;

  const handleNext = () => {
    if (currentStep < currentSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleUserTypeSelect = (type: 'investor' | 'syndicator') => {
    setSelectedUserType(type);
    setCurrentStep(0);
  };

  const handleGetStarted = () => {
    if (selectedUserType) {
      navigate(`/signup/${selectedUserType}/email`);
    }
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Real Estate Investor",
      content: "I've invested in 3 deals through EquityMD and couldn't be happier with the returns and passive income.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4&clothesColor=262e33"
    },
    {
      name: "Michael Rodriguez",
      role: "Real Estate Syndicator",
      content: "EquityMD has transformed how I raise capital. The platform makes everything so much more efficient.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael&backgroundColor=c0aede&clothesColor=3c4858"
    }
  ];

  if (!selectedUserType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center">
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
                  alt="EquityMD"
                  className="h-8"
                />
              </Link>
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <X className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Real Estate Syndication
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The premier platform connecting accredited investors with vetted real estate 
              syndication opportunities.
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Path</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Investor Card */}
              <button
                onClick={() => handleUserTypeSelect('investor')}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 text-left"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition">
                  <User className="h-8 w-8 text-blue-600 group-hover:text-white transition" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">I'm an Investor</h3>
                <p className="text-gray-600 mb-4">
                  I want to invest in real estate opportunities and build passive income.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Browse exclusive deals
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Start with $25,000
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Passive income streams
                  </div>
                </div>
              </button>

              {/* Syndicator Card */}
              <button
                onClick={() => handleUserTypeSelect('syndicator')}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 text-left"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                </div>
                
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition">
                  <Building2 className="h-8 w-8 text-purple-600 group-hover:text-white transition" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">I'm a Syndicator</h3>
                <p className="text-gray-600 mb-4">
                  I want to raise capital and connect with qualified investors.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Access 10,000+ investors
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Professional tools
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Faster fundraising
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Video Preview */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=450"
                  alt="Modern office building representing real estate investment opportunities"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Play className="h-5 w-5 text-gray-900 ml-1" />
                  </div>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Watch: How EquityMD Works (2 min)</p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">$500M+</div>
                <div className="text-gray-600 text-sm">Total Deals Funded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">10,000+</div>
                <div className="text-gray-600 text-sm">Active Investors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">18.5%</div>
                <div className="text-gray-600 text-sm">Average IRR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-2xl overflow-hidden max-w-4xl w-full">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <p className="text-white">Video Player Would Go Here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
                alt="EquityMD"
                className="h-8"
              />
            </Link>
            <button
              onClick={() => setSelectedUserType(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {currentSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {selectedUserType === 'investor' ? 'Investor' : 'Syndicator'} Onboarding
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / currentSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                  selectedUserType === 'investor' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {currentSteps[currentStep].icon}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentSteps[currentStep].title}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {currentSteps[currentStep].description}
                </p>
              </div>

              {/* Benefits */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="space-y-4">
                  {currentSteps[currentStep].benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial (on last step) */}
              {currentStep === currentSteps.length - 1 && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonials[selectedUserType === 'investor' ? 0 : 1].avatar}
                      alt="Testimonial"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonials[selectedUserType === 'investor' ? 0 : 1].name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonials[selectedUserType === 'investor' ? 0 : 1].role}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "{testimonials[selectedUserType === 'investor' ? 0 : 1].content}"
                  </p>
                </div>
              )}

              {/* Email Capture (on last step) */}
              {currentStep === currentSteps.length - 1 && (
                <div className="max-w-md mx-auto mb-8">
                  <div className="flex">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleGetStarted}
                      className={`px-6 py-3 text-white font-semibold rounded-r-lg transition ${
                        selectedUserType === 'investor' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      Get Started
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Free to join • No commitment required
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </button>

          <div className="flex space-x-2">
            {currentSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentStep 
                    ? selectedUserType === 'investor' ? 'bg-blue-600' : 'bg-purple-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < currentSteps.length - 1 ? (
            <button
              onClick={handleNext}
              className={`flex items-center px-6 py-2 text-white font-semibold rounded-lg transition ${
                selectedUserType === 'investor' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleGetStarted}
              className={`flex items-center px-6 py-2 text-white font-semibold rounded-lg transition ${
                selectedUserType === 'investor' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 