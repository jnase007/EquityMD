import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import type { SyndicatorProfile } from '../../types/database';

interface SyndicatorProfileFormProps {
  setMessage: (message: string) => void;
}

export function SyndicatorProfileForm({ setMessage }: SyndicatorProfileFormProps) {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [syndicatorProfile, setSyndicatorProfile] = useState<SyndicatorProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    avatarUrl: profile?.avatar_url || '',
    companyName: '',
    companyDescription: '',
    companyLogoUrl: '',
    websiteUrl: '',
    linkedinUrl: '',
    yearsInBusiness: '',
    totalDealVolume: '',
  });

  useEffect(() => {
    fetchSyndicatorProfile();
  }, []);

  // Auto-save functionality
  const autoSave = async (data: typeof formData) => {
    if (!user) return;
    
    setAutoSaving(true);
    try {
      // Update basic profile
      await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Update syndicator profile
      await supabase
        .from('syndicator_profiles')
        .update({
          company_name: data.companyName,
          company_description: data.companyDescription,
          company_logo_url: data.companyLogoUrl,
          website_url: data.websiteUrl,
          linkedin_url: data.linkedinUrl,
          years_in_business: data.yearsInBusiness ? parseInt(data.yearsInBusiness) : null,
          total_deal_volume: data.totalDealVolume ? parseFloat(data.totalDealVolume) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && Object.values(formData).some(value => value !== '') && !loading) {
        autoSave(formData);
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timeoutId);
  }, [formData, loading]);

  async function fetchSyndicatorProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from('syndicator_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching syndicator profile:', error);
      return;
    }

    setSyndicatorProfile(data);
    if (data) {
      setFormData(prev => ({
        ...prev,
        companyName: data.company_name || '',
        companyDescription: data.company_description || '',
        companyLogoUrl: data.company_logo_url || '',
        websiteUrl: data.website_url || '',
        linkedinUrl: data.linkedin_url || '',
        yearsInBusiness: data.years_in_business?.toString() || '',
        totalDealVolume: data.total_deal_volume?.toString() || '',
      }));
    }
  }

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // Update syndicator profile
      const { error: syndicatorError } = await supabase
        .from('syndicator_profiles')
        .update({
          company_name: formData.companyName,
          company_description: formData.companyDescription,
          company_logo_url: formData.companyLogoUrl,
          website_url: formData.websiteUrl,
          linkedin_url: formData.linkedinUrl,
          years_in_business: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null,
          total_deal_volume: formData.totalDealVolume ? parseFloat(formData.totalDealVolume) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (syndicatorError) throw syndicatorError;

      setLastSaved(new Date()); // Update last saved time for auto-save indicator
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-save indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {autoSaving && (
            <div className="flex items-center text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Auto-saving...
            </div>
          )}
          {lastSaved && !autoSaving && (
            <div className="flex items-center text-green-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

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
        <label className="block text-sm font-medium text-gray-700">
          Avatar URL
        </label>
        <input
          type="url"
          value={formData.avatarUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company Description
        </label>
        <textarea
          value={formData.companyDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company Logo URL
        </label>
        <input
          type="url"
          value={formData.companyLogoUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, companyLogoUrl: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Website URL
        </label>
        <input
          type="url"
          value={formData.websiteUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          LinkedIn URL
        </label>
        <input
          type="url"
          value={formData.linkedinUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Years in Business
        </label>
        <input
          type="number"
          value={formData.yearsInBusiness}
          onChange={(e) => setFormData(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Total Deal Volume ($)
        </label>
        <input
          type="number"
          value={formData.totalDealVolume}
          onChange={(e) => setFormData(prev => ({ ...prev, totalDealVolume: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Saving...
          </div>
        ) : (
          'Save Profile'
        )}
      </button>
    </form>
  );
}