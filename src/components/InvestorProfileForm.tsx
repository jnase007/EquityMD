import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { LocationAutocomplete } from './LocationAutocomplete';
import { SMSOptIn } from './SMSOptIn';
import type { InvestorProfile } from '../types/database';
import { HelpCircle } from 'lucide-react';

interface InvestorProfileFormProps {
  onComplete: () => void;
}

export function InvestorProfileForm({ onComplete }: InvestorProfileFormProps) {
  const { user, profile } = useAuthStore();
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
  const [loading, setLoading] = useState(false);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!user) return;
      // load profile & investor_profiles
      const [{ data: dbProfile }, { data: invProfile }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('investor_profiles').select('*').eq('id', user.id).single(),
      ]);
      if (dbProfile) {
        setFormData(prev => ({
          ...prev,
          fullName: dbProfile.full_name,
          avatarUrl: dbProfile.avatar_url,
          phoneNumber: dbProfile.phone_number,
          smsOptIn: dbProfile.sms_opt_in || false,
        }));
      }
      if (invProfile) {
        setInvestorProfile(invProfile);
        setFormData(prev => ({
          ...prev,
          accreditedStatus: invProfile.accredited_status,
          minimumInvestment: invProfile.minimum_investment?.toString() || '',
          preferredPropertyTypes: invProfile.preferred_property_types || [],
          preferredLocations: invProfile.preferred_locations || [],
          riskTolerance: invProfile.risk_tolerance,
          investmentGoals: invProfile.investment_goals,
        }));
      }
    }
    fetch();
  }, [user]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // update profiles
      const { error: pErr } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
          phone_number: formData.phoneNumber,
          sms_opt_in: formData.smsOptIn,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (pErr) throw pErr;

      // upsert investor_profiles
      const invData = {
        id: user.id,
        accredited_status: formData.accreditedStatus,
        minimum_investment: formData.minimumInvestment ? parseInt(formData.minimumInvestment.replace(/,/g, '')) : null,
        preferred_property_types: formData.preferredPropertyTypes,
        preferred_locations: formData.preferredLocations,
        risk_tolerance: formData.riskTolerance,
        investment_goals: formData.investmentGoals,
        updated_at: new Date().toISOString(),
      };
      const { error: iErr } = await supabase
        .from('investor_profiles')
        .upsert(invData, { onConflict: 'id' });
      if (iErr) throw iErr;

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Investor Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={e => handleChange('fullName', e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={e => handleChange('phoneNumber', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Profile Picture</label>
          <ImageUpload
            currentImageUrl={formData.avatarUrl}
            onImageUploaded={url => handleChange('avatarUrl', url)}
            bucket="avatars"
            folder="investors"
            circularCrop
            maxWidth={400}
            maxHeight={400}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.accreditedStatus}
            onChange={e => handleChange('accreditedStatus', e.target.checked)}
          />
          <span>I am an accredited investor</span>
          <HelpCircle className="ml-1" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Minimum Investment</label>
          <input
            type="text"
            value={formData.minimumInvestment}
            onChange={e => handleChange('minimumInvestment', e.target.value)}
            className="w-full border rounded p-2"
            placeholder="25,000"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Preferred Property Types</label>
          {/* implement checkboxes similar to above */}
        </div>
        <div>
          <label className="block font-semibold mb-1">Preferred Locations</label>
          <LocationAutocomplete
            value={formData.preferredLocations}
            onChange={locs => handleChange('preferredLocations', locs)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Risk Tolerance</label>
          <select
            value={formData.riskTolerance}
            onChange={e => handleChange('riskTolerance', e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Select</option>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Investment Goals</label>
          <textarea
            value={formData.investmentGoals}
            onChange={e => handleChange('investmentGoals', e.target.value)}
            className="w-full border rounded p-2"
            rows={3}
          />
        </div>
        <SMSOptIn
          userId={user?.id || ''}
          currentPhone={formData.phoneNumber}
          currentOptIn={formData.smsOptIn}
          onUpdate={(optIn, phone) => {
            handleChange('smsOptIn', optIn);
            handleChange('phoneNumber', phone);
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
