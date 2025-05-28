import React, { useState } from 'react';
import { CheckCircle, DollarSign, TrendingUp, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface InvestmentReadinessFlowProps {
  onComplete: (data: InvestmentReadinessData) => void;
  onClose: () => void;
}

interface InvestmentReadinessData {
  liquidity: string;
  currentInvestments: string[];
  timeline: string;
}

export function InvestmentReadinessFlow({ onComplete, onClose }: InvestmentReadinessFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InvestmentReadinessData>({
    liquidity: '',
    currentInvestments: [],
    timeline: ''
  });

  const liquidityOptions = [
    {
      value: '$25,000 - $100,000',
      label: '$25K - $100K',
      description: 'Ready to diversify with real estate',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      value: '$100,001 - $250,000',
      label: '$100K - $250K',
      description: 'Strong foundation for multiple deals',
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      value: 'More than $250,000',
      label: '$250K+',
      description: 'Significant capital for portfolio building',
      icon: <TrendingUp className="h-6 w-6" />
    }
  ];

  const investmentOptions = [
    {
      value: 'stocks/bonds',
      label: 'Stocks & Bonds',
      description: 'Traditional securities'
    },
    {
      value: 'checking/savings_account',
      label: 'Cash & Savings',
      description: 'Bank accounts and CDs'
    },
    {
      value: 'real_estate/home_equity',
      label: 'Real Estate',
      description: 'Property investments'
    },
    {
      value: 'IRA/401K',
      label: 'Retirement Accounts',
      description: 'IRA, 401K, etc.'
    },
    {
      value: 'Other',
      label: 'Other Investments',
      description: 'Alternative investments'
    }
  ];

  const timelineOptions = [
    {
      value: 'Immediately',
      label: 'Ready Now',
      description: 'I want to invest right away',
      icon: <Clock className="h-6 w-6 text-green-600" />
    },
    {
      value: '1-3 Months',
      label: '1-3 Months',
      description: 'Planning to invest soon',
      icon: <Clock className="h-6 w-6 text-blue-600" />
    },
    {
      value: '3-6 Months',
      label: '3-6 Months',
      description: 'Building up to invest',
      icon: <Clock className="h-6 w-6 text-orange-600" />
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.liquidity !== '';
      case 2:
        return formData.currentInvestments.length > 0;
      case 3:
        return formData.timeline !== '';
      default:
        return false;
    }
  };

  const toggleInvestment = (investment: string) => {
    setFormData(prev => ({
      ...prev,
      currentInvestments: prev.currentInvestments.includes(investment)
        ? prev.currentInvestments.filter(i => i !== investment)
        : [...prev.currentInvestments, investment]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                How much are you looking to invest?
              </h2>
              <p className="text-gray-600">
                This helps us show you deals that match your investment capacity
              </p>
            </div>

            <div className="space-y-3">
              {liquidityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, liquidity: option.value }))}
                  className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    formData.liquidity === option.value
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-4 ${
                      formData.liquidity === option.value
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">{option.label}</div>
                      <div className="text-gray-600 text-sm">{option.description}</div>
                    </div>
                    {formData.liquidity === option.value && (
                      <CheckCircle className="h-6 w-6 text-green-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Where are your funds currently invested?
              </h2>
              <p className="text-gray-600">
                Select all that apply - this helps us understand your investment experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investmentOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleInvestment(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    formData.currentInvestments.includes(option.value)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{option.label}</div>
                      {formData.currentInvestments.includes(option.value) && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                When are you looking to invest?
              </h2>
              <p className="text-gray-600">
                This helps us prioritize which opportunities to show you first
              </p>
            </div>

            <div className="space-y-3">
              {timelineOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, timeline: option.value }))}
                  className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    formData.timeline === option.value
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-4 ${
                      formData.timeline === option.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">{option.label}</div>
                      <div className="text-gray-600 text-sm">{option.description}</div>
                    </div>
                    {formData.timeline === option.value && (
                      <CheckCircle className="h-6 w-6 text-purple-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Investment Readiness</h1>
              <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full ${
                    step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t p-6">
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-2 rounded-lg transition ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center px-6 py-2 rounded-lg transition ${
                isStepValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === 3 ? 'Complete' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 