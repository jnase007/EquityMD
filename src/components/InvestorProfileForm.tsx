import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { InvestmentRangeSelector } from './InvestmentRangeSelector';
import { Tooltip, InfoIcon } from './Tooltip';
import { SMSOptIn } from './SMSOptIn';
import type { InvestorProfile } from '../types/database';
import { Upload, User, DollarSign, MapPin, Target, MessageSquare, Phone, HelpCircle } from 'lucide-react';
import { useAutoSave } from '../hooks/useAutoSave';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { LocationAutocomplete } from './LocationAutocomplete';

interface InvestorProfileFormProps {
  onComplete: () => void;
}

export function InvestorProfileForm({ onComplete }: InvestorProfileFormProps) {
  const { user, profile } = useAuthStore();
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    avatarUrl: profile?.avatar_url || '',
    phoneNumber: profile?.phone_number || '',
    accreditedStatus: false,
    minimumInvestment: '',
    preferredPropertyTypes: [] as string[],
    preferredLocations: [] as string[],
    riskTolerance: '',
    investmentGoals: '',
    smsOptIn: profile?.sms_opt_in || false,
  });

  // Auto-save hook
  const autoSave = useAutoSave(formData, {
    delay: 2000, // Save after 2 seconds of no changes
    onSave: async (data) => {
      if (!user) throw new Error('User not authenticated');

      // Save profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          avatar_url: data.avatarUrl,
          phone_number: data.phoneNumber,
          sms_opt_in: data.smsOptIn,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Save investor profile data
      const investorData = {
        user_id: user.id,
        accredited_status: data.accreditedStatus,
        minimum_investment: data.minimumInvestment ? parseInt(data.minimumInvestment) : null,
        preferred_property_types: data.preferredPropertyTypes,
        preferred_locations: data.preferredLocations,
        risk_tolerance: data.riskTolerance,
        investment_goals: data.investmentGoals,
      };

      const { error: investorError } = await supabase
        .from('investor_profiles')
        .upsert(investorData, { onConflict: 'user_id' });

      if (investorError) throw investorError;
    },
    onSuccess: () => {
      console.log('Profile saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save profile:', error);
    }
  });

  useEffect(() => {
    fetchInvestorProfile();
  }, []);

  // Helper function to format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  async function fetchInvestorProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching investor profile:', error);
      return;
    }

    setInvestorProfile(data);
    if (data) {
      console.log('Fetched investor profile data:', data);
      console.log('Preferred locations from DB:', data.preferred_locations);
      
      setFormData(prev => ({
        ...prev,
        accreditedStatus: data.accredited_status || false,
        minimumInvestment: data.minimum_investment ? data.minimum_investment.toString() : '',
        preferredPropertyTypes: Array.isArray(data.preferred_property_types) ? data.preferred_property_types : [],
        preferredLocations: Array.isArray(data.preferred_locations) ? data.preferred_locations : [],
        riskTolerance: data.risk_tolerance || '',
        investmentGoals: data.investment_goals || '',
      }));
    }
  }

  const propertyTypes = [
    'Multi-Family',
    'Office',
    'Retail',
    'Industrial',
    'Medical',
    'Student Housing',
  ];

  // Helper function to parse formatted numbers with commas
  const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/,/g, '')) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaving(true);

    try {
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
          phone_number: formData.phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // Parse minimum investment correctly (handle comma-formatted numbers)
      const minimumInvestmentValue = formData.minimumInvestment 
        ? parseFormattedNumber(formData.minimumInvestment) 
        : null;

      // Update investor profile
      const { error: investorError } = await supabase
        .from('investor_profiles')
        .update({
          accredited_status: formData.accreditedStatus,
          minimum_investment: minimumInvestmentValue,
          preferred_property_types: formData.preferredPropertyTypes,
          preferred_locations: formData.preferredLocations,
          risk_tolerance: formData.riskTolerance,
          investment_goals: formData.investmentGoals,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (investorError) throw investorError;

      console.log('Profile updated successfully');
      
      // Refresh the investor profile to show the updated values
      await fetchInvestorProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaving(false);
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleSMSUpdate = (optIn: boolean, phone: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: phone,
      smsOptIn: optIn
    }));
  };

  const accreditedInvestorTooltip = "An accredited investor is defined by the SEC as someone who: (1) has earned income that exceeded $200,000 (or $300,000 together with a spouse) in each of the prior two years, and reasonably expects the same for the current year, OR (2) has a net worth over $1 million, either alone or together with a spouse (excluding the value of their primary residence). This status allows participation in certain private investment opportunities.";

  // Helper function to format numbers with commas
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');
    
    // Format with commas
    if (numericValue === '') return '';
    return new Intl.NumberFormat('en-US').format(parseInt(numericValue));
  };

  // Helper function to handle minimum investment input change
  const handleMinimumInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumberWithCommas(e.target.value);
    autoSave.updateData(prev => ({ ...prev, minimumInvestment: formattedValue }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Investor Profile</h2>
        <AutoSaveIndicator 
          state={autoSave.state} 
          showDetails={false}
        />
      </div>

      {/* Auto-save status details */}
      {(autoSave.hasUnsavedChanges || autoSave.lastSaved) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <AutoSaveIndicator 
            state={autoSave.state} 
            showDetails={true}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            disabled
            value={user?.email}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={autoSave.data.fullName}
              onChange={(e) => autoSave.updateData(prev => ({ ...prev, fullName: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={autoSave.data.phoneNumber}
              onChange={(e) => autoSave.updateData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-900 mb-3">
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

        {/* Investment Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Investment Preferences</h3>
          
          <div>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoSave.data.accreditedStatus}
                  onChange={(e) => autoSave.updateData(prev => ({ ...prev, accreditedStatus: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">I am an accredited investor</span>
              </label>
              <div className="relative group">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-normal w-80 z-10">
                  {accreditedInvestorTooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Minimum Investment Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">$</span>
              </div>
              <input
                type="text"
                value={autoSave.data.minimumInvestment}
                onChange={handleMinimumInvestmentChange}
                className="pl-8 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="25,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Preferred Property Types
            </label>
            <div className="mt-2 space-y-2">
              {['Multifamily', 'Commercial', 'Industrial', 'Retail', 'Mixed-Use', 'Land Development'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoSave.data.preferredPropertyTypes.includes(type)}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...autoSave.data.preferredPropertyTypes, type]
                        : autoSave.data.preferredPropertyTypes.filter(t => t !== type);
                      autoSave.updateData(prev => ({ ...prev, preferredPropertyTypes: types }));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Preferred Investment Locations
            </label>
            <LocationAutocomplete
              value={autoSave.data.preferredLocations}
              onChange={(locations) => autoSave.updateData(prev => ({ ...prev, preferredLocations: locations }))}
              placeholder="Start typing a state name (e.g., Texas, California, Florida)"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Risk Tolerance
            </label>
            <select
              value={autoSave.data.riskTolerance}
              onChange={(e) => autoSave.updateData(prev => ({ ...prev, riskTolerance: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select risk tolerance</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Investment Goals
            </label>
            <textarea
              value={autoSave.data.investmentGoals}
              onChange={(e) => autoSave.updateData(prev => ({ ...prev, investmentGoals: e.target.value }))}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your investment goals and objectives..."
            />
          </div>
        </div>

        {/* SMS Opt-in Component */}
        <SMSOptIn
          userId={user?.id || ''}
          currentPhone={autoSave.data.phoneNumber}
          currentOptIn={autoSave.data.smsOptIn}
          onUpdate={(optIn: boolean, phone: string) => {
            autoSave.updateData(prev => ({ 
              ...prev, 
              smsOptIn: optIn,
              phoneNumber: phone
            }));
          }}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}