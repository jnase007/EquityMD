import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { DealMediaUpload } from './DealMediaUpload';
import { Building2, Plus, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { SyndicatorProfile } from '../types/database';
import { calculateProfileCompletion, getCompletionStatusMessage } from '../lib/syndicator-completion';

interface SyndicatorProfileFormProps {
  setMessage: (message: string) => void;
}

interface PastDeal {
  title: string;
  location: string;
  type: string;
  exitYear: number;
  irr: number;
  equity: number;
  image: string;
}

export function SyndicatorProfileForm({ setMessage }: SyndicatorProfileFormProps) {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [syndicatorProfile, setSyndicatorProfile] = useState<SyndicatorProfile | null>(null);
  const [pastDeals, setPastDeals] = useState<PastDeal[]>([]);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDeal, setNewDeal] = useState<PastDeal>({
    title: '',
    location: '',
    type: '',
    exitYear: new Date().getFullYear(),
    irr: 0,
    equity: 0,
    image: ''
  });

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
    state: '',
    city: '',
  });

  useEffect(() => {
    fetchSyndicatorProfile();
  }, []);

  async function fetchSyndicatorProfile() {
    if (!user) return;

    try {
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
          state: data.state || '',
          city: data.city || '',
        }));

        // Fetch past deals from verification_documents
        if (data.verification_documents?.past_deals) {
          setPastDeals(data.verification_documents.past_deals);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

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
          state: formData.state,
          city: formData.city,
          verification_documents: {
            ...syndicatorProfile?.verification_documents,
            past_deals: pastDeals
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (syndicatorError) throw syndicatorError;

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = () => {
    if (!newDeal.title || !newDeal.location) return;

    setPastDeals([...pastDeals, newDeal]);
    setNewDeal({
      title: '',
      location: '',
      type: '',
      exitYear: new Date().getFullYear(),
      irr: 0,
      equity: 0,
      image: ''
    });
    setShowAddDeal(false);
  };

  const handleRemoveDeal = (index: number) => {
    setPastDeals(pastDeals.filter((_, i) => i !== index));
  };

  const profileCompletion = syndicatorProfile ? calculateProfileCompletion({
    company_name: syndicatorProfile.company_name,
    company_description: syndicatorProfile.company_description,
    company_logo_url: syndicatorProfile.company_logo_url,
    state: syndicatorProfile.state,
    city: syndicatorProfile.city,
    website_url: syndicatorProfile.website_url,
    years_in_business: syndicatorProfile.years_in_business,
    total_deal_volume: syndicatorProfile.total_deal_volume
  }) : { percentage: 0, isComplete: false, missingFields: [] };
  
  const completionStatusMessage = syndicatorProfile ? getCompletionStatusMessage({
    company_name: syndicatorProfile.company_name,
    company_description: syndicatorProfile.company_description,
    company_logo_url: syndicatorProfile.company_logo_url,
    state: syndicatorProfile.state,
    city: syndicatorProfile.city,
    website_url: syndicatorProfile.website_url,
    years_in_business: syndicatorProfile.years_in_business,
    total_deal_volume: syndicatorProfile.total_deal_volume
  }) : "Complete your profile to appear in the directory.";

  return (
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

      <div>
        <label className="block text-base font-semibold text-gray-900 mb-2">
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
        <label className="block text-base font-semibold text-gray-900 mb-3">
          Profile Picture
        </label>
        <ImageUpload
          currentImageUrl={formData.avatarUrl}
          onImageUploaded={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
          bucket="avatars"
          folder="syndicators"
          showEditor={true}
          circularCrop={true}
          cropAspectRatio={1}
          maxWidth={400}
          maxHeight={400}
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-900 mb-2">
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
        <label className="block text-base font-semibold text-gray-900 mb-2">
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
        <label className="block text-base font-semibold text-gray-900 mb-3">
          Company Logo
        </label>
        <ImageUpload
          currentImageUrl={formData.companyLogoUrl}
          onImageUploaded={(url) => setFormData(prev => ({ ...prev, companyLogoUrl: url }))}
          bucket="logos"
          folder="companies"
          showEditor={true}
          circularCrop={false}
          cropAspectRatio={1}
          maxWidth={600}
          maxHeight={600}
        />
        <p className="mt-2 text-sm text-gray-500">
          Recommended: Square format (1:1 aspect ratio) for best display
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-900 mb-2">
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
        <label className="block text-base font-semibold text-gray-900 mb-2">
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
        <label className="block text-base font-semibold text-gray-900 mb-2">
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
        <label className="block text-base font-semibold text-gray-900 mb-2">
          Total Deal Volume ($)
        </label>
        <input
          type="number"
          value={formData.totalDealVolume}
          onChange={(e) => setFormData(prev => ({ ...prev, totalDealVolume: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Past Deals Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Past Deals</h3>
          <button
            type="button"
            onClick={() => setShowAddDeal(true)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Deal
          </button>
        </div>

        {showAddDeal && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Title</label>
                <input
                  type="text"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  value={newDeal.location}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, location: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Property Type</label>
                <input
                  type="text"
                  value={newDeal.type}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Exit Year</label>
                <input
                  type="number"
                  value={newDeal.exitYear}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, exitYear: parseInt(e.target.value) }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">IRR (%)</label>
                <input
                  type="number"
                  value={newDeal.irr}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, irr: parseFloat(e.target.value) }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Total Equity ($)</label>
                <input
                  type="number"
                  value={newDeal.equity}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, equity: parseFloat(e.target.value) }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-900 mb-2">Image URL</label>
              <input
                type="url"
                value={newDeal.image}
                onChange={(e) => setNewDeal(prev => ({ ...prev, image: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowAddDeal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDeal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Deal
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {pastDeals.map((deal, index) => (
            <div key={index} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-24 h-24">
                    <img
                      src={deal.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                      alt={deal.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{deal.title}</h4>
                    <p className="text-gray-500">{deal.location}</p>
                    <p className="text-sm text-gray-500">{deal.type}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDeal(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-sm text-gray-500">Exit Year</div>
                  <div className="font-medium">{deal.exitYear}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">IRR</div>
                  <div className="font-medium text-green-600">{deal.irr}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Equity</div>
                  <div className="font-medium">${deal.equity.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium">Profile Completion</h2>
        <div className="mt-2">
          <div className="flex items-center">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-4 bg-blue-600 rounded-full"
                style={{ width: `${profileCompletion.percentage}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-500">{profileCompletion.percentage}%</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">{completionStatusMessage}</p>
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