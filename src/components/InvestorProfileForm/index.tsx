import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { ImageUpload } from '../ImageUpload';
import { InvestmentRangeSelector } from '../InvestmentRangeSelector';
import { AlertCircle, HelpCircle } from 'lucide-react';
import type { InvestorProfile } from '../../types/database';
import { LocationAutocomplete } from '../LocationAutocomplete';

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

export function InvestorProfileForm({ setMessage }: InvestorProfileFormProps) {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAccreditedInfo, setShowAccreditedInfo] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    avatarUrl: profile?.avatar_url || '',
    phoneNumber: '',
    bio: '',
    investmentRange: '',
    location: '',
    state: '',
    preferredLocations: [] as string[],
    yearsInvesting: '',
    experienceLevel: '',
    accreditedStatus: false,
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
          investmentRange: data.minimum_investment ? data.minimum_investment.toString() : '',
          preferredPropertyTypes: data.preferred_property_types || [],
          preferredLocations: data.preferred_locations || [],
          accreditedStatus: data.accredited_status || false,
          experienceLevel: data.investment_preferences?.experience_level || '',
          yearsInvesting: data.investment_preferences?.years_investing || '',
          bio: data.investment_preferences?.bio || '',
          phoneNumber: data.investment_preferences?.phone_number || '',
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
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
          email_notifications: emailPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Parse investment range correctly (handle comma-formatted numbers)
      const investmentRangeValue = formData.investmentRange 
        ? parseFormattedNumber(formData.investmentRange) 
        : null;

      // Update investor profile
      const { error: investorError } = await supabase
        .from('investor_profiles')
        .update({
          accredited_status: formData.accreditedStatus,
          minimum_investment: investmentRangeValue,
          preferred_property_types: formData.preferredPropertyTypes,
          preferred_locations: formData.preferredLocations,
          investment_preferences: {
            experience_level: formData.experienceLevel,
            years_investing: formData.yearsInvesting,
            bio: formData.bio,
            phone_number: formData.phoneNumber,
            state: formData.state
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
                showEditor={true}
                circularCrop={true}
                cropAspectRatio={1}
                maxWidth={400}
                maxHeight={400}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Short Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us a bit about yourself and your investment goals..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Investment Profile</h2>

            <InvestmentRangeSelector
              value={formData.investmentRange}
              onChange={(value) => setFormData(prev => ({ ...prev, investmentRange: value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Years of Investment Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsInvesting}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsInvesting: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Experience Level</option>
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Accredited Investor Status
                </label>
                <button
                  type="button"
                  onClick={() => setShowAccreditedInfo(!showAccreditedInfo)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accreditedStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, accreditedStatus: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I am an accredited investor
                  </span>
                </label>
              </div>
              {showAccreditedInfo && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm">
                  <h4 className="font-medium text-gray-900 mb-2">SEC Accredited Investor Definition</h4>
                  <p className="text-gray-600 mb-3">
                    Under SEC regulations, an accredited investor is someone who:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2">•</div>
                      <p className="text-gray-600">
                        <span className="font-medium">Income Test:</span> Has earned income that exceeded $200,000 (or $300,000 together with a spouse) in each of the prior two years, and reasonably expects the same for the current year, OR
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2">•</div>
                      <p className="text-gray-600">
                        <span className="font-medium">Net Worth Test:</span> Has a net worth over $1 million, either alone or together with a spouse (excluding the value of their primary residence)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                    <p className="text-blue-800 text-xs">
                      <strong>Note:</strong> Accredited investor status is required for participation in many private real estate investment opportunities and helps syndicators ensure compliance with SEC regulations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Investment Preferences</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State of Residence
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Your State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Investment Locations
              </label>
              <LocationAutocomplete
                value={formData.preferredLocations}
                onChange={(locations) => setFormData(prev => ({ 
                  ...prev, 
                  preferredLocations: locations
                }))}
                placeholder="Start typing a state name (e.g., Texas, California, Florida)"
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Property Types
              </label>
              <div className="grid grid-cols-2 gap-4">
                {PROPERTY_TYPES.map(type => (
                  <label key={type} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferredPropertyTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.preferredPropertyTypes, type]
                          : formData.preferredPropertyTypes.filter(t => t !== type);
                        setFormData(prev => ({ ...prev, preferredPropertyTypes: newTypes }));
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailPreferences.messages}
                    onChange={(e) => setEmailPreferences(prev => ({
                      ...prev,
                      messages: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    New messages from syndicators
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailPreferences.deal_updates}
                    onChange={(e) => setEmailPreferences(prev => ({
                      ...prev,
                      deal_updates: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Updates on deals I'm interested in
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailPreferences.investment_status}
                    onChange={(e) => setEmailPreferences(prev => ({
                      ...prev,
                      investment_status: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Investment status changes
                  </span>
                </label>
              </div>
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