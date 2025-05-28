import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { ImageUpload } from '../ImageUpload';
import { InvestmentRangeSelector } from '../InvestmentRangeSelector';
import { AlertCircle, HelpCircle } from 'lucide-react';
import type { InvestorProfile } from '../../types/database';

interface InvestorProfileFormProps {
  setMessage: (message: string) => void;
}

const INVESTMENT_RANGES = [
  { label: '$0 - $50,000', value: 50000, display: '$0 - $50,000' },
  { label: '$50,000 - $100,000', value: 100000, display: '$50,000 - $100,000' },
  { label: '$100,000 - $250,000', value: 250000, display: '$100,000 - $250,000' },
  { label: '$250,000 - $500,000', value: 500000, display: '$250,000 - $500,000' },
  { label: '$500,000 - $1,000,000', value: 1000000, display: '$500,000 - $1,000,000' },
  { label: '$1,000,000 - $5,000,000', value: 5000000, display: '$1,000,000 - $5,000,000' },
  { label: '$5,000,000+', value: 5000001, display: '$5,000,000+' }
];

const EXPERIENCE_LEVELS = [
  { label: 'None - I\'m new to real estate investing', value: 'none' },
  { label: 'Some - I\'ve made a few investments', value: 'some' },
  { label: 'Expert - I\'m an experienced real estate investor', value: 'expert' }
];

const INVESTOR_TYPES = [
  'Individual',
  'Family Office',
  'Private Equity Fund',
  'Hedge Fund',
  'Pension Fund',
  'Insurance Company',
  'Endowment',
  'Foundation',
  'Investment Advisor',
  'Registered Investment Advisor (RIA)',
  'Other'
];

const INVESTMENT_INTERESTS = [
  'Multifamily',
  'Office',
  'Retail',
  'Industrial',
  'Mixed Use',
  'Hotels',
  'Self Storage',
  'Medical',
  'Student Housing',
  'Senior Living',
  'Land Development',
  'All Property Types'
];

const PREFERRED_TERMS = [
  '1-2 years',
  '3-5 years',
  '5-7 years',
  '7-10 years',
  '10+ years',
  'No preference'
];

const WHEN_TO_INVEST_OPTIONS = [
  'Immediately',
  'Within 3 months',
  'Within 6 months',
  'Within 1 year',
  'No specific timeline'
];

const SPONSORSHIP_OPTIONS = [
  'Lead Sponsor',
  'Co-Sponsor',
  'Limited Partner Only',
  'Open to All'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const PROPERTY_TYPES = [
  'Multi-Family',
  'Office',
  'Retail',
  'Industrial',
  'Medical',
  'Student Housing',
  'Self-Storage',
  'Hotel/Hospitality',
  'Senior Living',
  'Mixed-Use'
];

export function InvestorProfileForm({ setMessage }: InvestorProfileFormProps) {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAccreditedInfo, setShowAccreditedInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    avatarUrl: profile?.avatar_url || '',
    phone: '',
    investorType: '',
    investmentSize: '',
    investmentInterest: '',
    minAnnualCoC: '',
    preferredTerm: '',
    whenToInvest: '',
    accredited: false,
    sponsorship: '',
    state: '',
    bio: '',
    location: '',
    preferredLocations: [] as string[],
    yearsInvesting: '',
    experienceLevel: '',
    preferredPropertyTypes: [] as string[],
  });

  const [emailPreferences, setEmailPreferences] = useState({
    messages: true,
    deal_updates: true,
    investment_status: true
  });

  useEffect(() => {
    if (profile?.email_notifications) {
      setEmailPreferences(profile.email_notifications);
    }
  }, [profile]);

  useEffect(() => {
    fetchInvestorProfile();
  }, []);

  async function fetchInvestorProfile() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(prev => ({
          ...prev,
          name: data.investment_preferences?.name || profile?.full_name || '',
          investmentSize: data.minimum_investment ? data.minimum_investment.toString() : '',
          preferredPropertyTypes: data.preferred_property_types || [],
          preferredLocations: data.preferred_locations || [],
          accredited: data.accredited_status || false,
          experienceLevel: data.investment_preferences?.experience_level || '',
          yearsInvesting: data.investment_preferences?.years_investing || '',
          bio: data.investment_preferences?.bio || '',
          phone: data.investment_preferences?.phone || '',
          investorType: data.investment_preferences?.investorType || '',
          investmentInterest: data.investment_preferences?.investmentInterest || '',
          minAnnualCoC: data.investment_preferences?.minAnnualCoC || '',
          preferredTerm: data.investment_preferences?.preferredTerm || '',
          whenToInvest: data.investment_preferences?.whenToInvest || '',
          sponsorship: data.investment_preferences?.sponsorship || '',
          state: data.investment_preferences?.state || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching investor profile:', error);
    }
  }

  // Helper function to parse formatted numbers with commas
  const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/,/g, '')) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: `${formData.name}`.trim(),
          avatar_url: formData.avatarUrl,
          email_notifications: emailPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Parse investment range correctly (handle comma-formatted numbers)
      const investmentRangeValue = formData.investmentSize 
        ? parseFormattedNumber(formData.investmentSize) 
        : null;

      // Update investor profile
      const { error: investorError } = await supabase
        .from('investor_profiles')
        .update({
          accredited_status: formData.accredited,
          minimum_investment: investmentRangeValue,
          preferred_property_types: formData.preferredPropertyTypes,
          preferred_locations: formData.preferredLocations,
          investment_preferences: {
            name: formData.name,
            experience_level: formData.experienceLevel,
            years_investing: formData.yearsInvesting,
            bio: formData.bio,
            phone: formData.phone,
            investorType: formData.investorType,
            investmentInterest: formData.investmentInterest,
            minAnnualCoC: formData.minAnnualCoC,
            preferredTerm: formData.preferredTerm,
            whenToInvest: formData.whenToInvest,
            sponsorship: formData.sponsorship,
            state: formData.state,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (investorError) throw investorError;

      setMessage('Profile updated successfully!');
      
      // Refresh the investor profile to show the updated values
      await fetchInvestorProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <ImageUpload
                currentImageUrl={formData.avatarUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                bucket="avatars"
                folder="investors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed here</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1-555-123-4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State *
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Investment Profile</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Investor Type *
              </label>
              <select
                value={formData.investorType}
                onChange={(e) => setFormData(prev => ({ ...prev, investorType: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Investor Type</option>
                {INVESTOR_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Size *
              </label>
              <InvestmentRangeSelector
                value={formData.investmentSize}
                onChange={(value) => setFormData(prev => ({ ...prev, investmentSize: value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Investment Interest *
              </label>
              <select
                value={formData.investmentInterest}
                onChange={(e) => setFormData(prev => ({ ...prev, investmentInterest: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Property Type Interest</option>
                {INVESTMENT_INTERESTS.map(interest => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Annual Cash-on-Cash Return (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.minAnnualCoC}
                onChange={(e) => setFormData(prev => ({ ...prev, minAnnualCoC: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 8.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Investment Term
              </label>
              <select
                value={formData.preferredTerm}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredTerm: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Preferred Term</option>
                {PREFERRED_TERMS.map(term => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                When Are You Looking to Invest?
              </label>
              <select
                value={formData.whenToInvest}
                onChange={(e) => setFormData(prev => ({ ...prev, whenToInvest: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Timeline</option>
                {WHEN_TO_INVEST_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sponsorship Interest
              </label>
              <select
                value={formData.sponsorship}
                onChange={(e) => setFormData(prev => ({ ...prev, sponsorship: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Sponsorship Level</option>
                {SPONSORSHIP_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={formData.accredited}
                    onChange={(e) => setFormData(prev => ({ ...prev, accredited: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">
                    I am an accredited investor
                  </label>
                  <p className="text-gray-500">
                    Accredited investors meet certain income or net worth requirements as defined by the SEC.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAccreditedInfo(!showAccreditedInfo)}
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    Learn more about accreditation requirements
                  </button>
                </div>
              </div>

              {showAccreditedInfo && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Accredited Investor Requirements</h4>
                  <p className="text-blue-800 text-sm mt-2">
                    To qualify as an accredited investor, you must meet one of the following criteria:
                  </p>
                  <ul className="list-disc list-inside text-blue-800 text-sm mt-2 space-y-1">
                    <li>Individual income exceeding $200,000 (or $300,000 joint income) in each of the prior two years</li>
                    <li>Net worth exceeding $1,000,000 (excluding primary residence)</li>
                    <li>Hold certain professional certifications or designations</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio / Investment Background
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about your investment background, experience, and what you're looking for in real estate investments..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Investment Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Experience Level</option>
                <option value="beginner">Beginner (0-2 years)</option>
                <option value="intermediate">Intermediate (3-7 years)</option>
                <option value="experienced">Experienced (8-15 years)</option>
                <option value="expert">Expert (15+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Years Actively Investing in Real Estate
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsInvesting}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsInvesting: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Types of Interest (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferredPropertyTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            preferredPropertyTypes: [...prev.preferredPropertyTypes, type]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            preferredPropertyTypes: prev.preferredPropertyTypes.filter(t => t !== type)
                          }));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Geographic Locations
              </label>
              <input
                type="text"
                value={formData.preferredLocations.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  preferredLocations: e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc)
                }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., California, Texas, Florida (comma-separated)"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Basic Info', 'Investment Profile', 'Preferences'].map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(index + 1)}
              className={`text-sm font-medium ${
                currentStep === index + 1 ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step}
            </button>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {renderStep()}

      <div className="flex justify-between pt-6">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
        )}
        
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        )}
      </div>
    </form>
  );
}