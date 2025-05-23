import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { Tooltip, InfoIcon } from './Tooltip';
import { SMSOptIn } from './SMSOptIn';
import type { InvestorProfile } from '../types/database';

interface InvestorProfileFormProps {
  setMessage: (message: string) => void;
}

export function InvestorProfileForm({ setMessage }: InvestorProfileFormProps) {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
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

  useEffect(() => {
    fetchInvestorProfile();
  }, []);

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
      setFormData(prev => ({
        ...prev,
        accreditedStatus: data.accredited_status,
        minimumInvestment: data.minimum_investment?.toString() || '',
        preferredPropertyTypes: data.preferred_property_types || [],
        preferredLocations: data.preferred_locations || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

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

      // Update investor profile
      const { error: investorError } = await supabase
        .from('investor_profiles')
        .update({
          accredited_status: formData.accreditedStatus,
          minimum_investment: formData.minimumInvestment ? parseFloat(formData.minimumInvestment) : null,
          preferred_property_types: formData.preferredPropertyTypes,
          preferred_locations: formData.preferredLocations,
          risk_tolerance: formData.riskTolerance,
          investment_goals: formData.investmentGoals,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (investorError) throw investorError;

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSUpdate = (optIn: boolean, phone: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: phone,
      smsOptIn: optIn
    }));
  };

  const accreditedInvestorTooltip = "An accredited investor has an annual income over $200,000 ($300,000 joint) for 2 years, or a net worth over $1M (excluding home), or specific professional licenses. This SEC definition allows you to invest in private deals on Equitymd.com.";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          disabled
          value={user?.email}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

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
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="+1-555-123-4567"
        />
      </div>

      {/* SMS Opt-in Component */}
      <SMSOptIn
        userId={user?.id || ''}
        currentPhone={formData.phoneNumber}
        currentOptIn={formData.smsOptIn}
        onUpdate={handleSMSUpdate}
      />

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.accreditedStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, accreditedStatus: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            I am an accredited investor
          </span>
          <Tooltip content={accreditedInvestorTooltip} position="right" maxWidth="320px">
            <div className="ml-2 cursor-help">
              <InfoIcon className="w-4 h-4 text-blue-500 hover:text-blue-600" />
            </div>
          </Tooltip>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Minimum Investment ($)
        </label>
        <input
          type="number"
          value={formData.minimumInvestment}
          onChange={(e) => setFormData(prev => ({ ...prev, minimumInvestment: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Property Types
        </label>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map((type) => (
            <label key={type} className="flex items-center">
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
        <label className="block text-sm font-medium text-gray-700">
          Preferred Locations (comma-separated)
        </label>
        <input
          type="text"
          value={formData.preferredLocations.join(', ')}
          onChange={(e) => {
            const locations = e.target.value.split(',').map(l => l.trim()).filter(Boolean);
            setFormData(prev => ({ ...prev, preferredLocations: locations }));
          }}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., New York, California, Texas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Risk Tolerance
        </label>
        <select
          value={formData.riskTolerance}
          onChange={(e) => setFormData(prev => ({ ...prev, riskTolerance: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Risk Tolerance</option>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Investment Goals
        </label>
        <textarea
          value={formData.investmentGoals}
          onChange={(e) => setFormData(prev => ({ ...prev, investmentGoals: e.target.value }))}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your investment goals and strategy..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}