import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { Building2, Plus, X, CheckCircle, AlertCircle, ArrowLeft, Save, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Syndicator {
  id: string;
  company_name: string;
  company_description: string | null;
  company_logo_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  years_in_business: number | null;
  total_deal_volume: number | null;
  state: string | null;
  city: string | null;
  verification_documents: any;
  verification_status: string;
  claimed_by: string | null;
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

interface SyndicatorProfileEditorProps {
  syndicator: Syndicator | null;
  onSave: (syndicator: Syndicator) => void;
  onCancel: () => void;
}

export function SyndicatorProfileEditor({ syndicator, onSave, onCancel }: SyndicatorProfileEditorProps) {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
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
    if (syndicator) {
      setFormData({
        companyName: syndicator.company_name || '',
        companyDescription: syndicator.company_description || '',
        companyLogoUrl: syndicator.company_logo_url || '',
        websiteUrl: syndicator.website_url || '',
        linkedinUrl: syndicator.linkedin_url || '',
        yearsInBusiness: syndicator.years_in_business?.toString() || '',
        totalDealVolume: syndicator.total_deal_volume?.toString() || '',
        state: syndicator.state || '',
        city: syndicator.city || '',
      });

      // Load past deals from verification_documents
      if (syndicator.verification_documents?.past_deals) {
        setPastDeals(syndicator.verification_documents.past_deals);
      }
    }
  }, [syndicator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !syndicator) return;

    setLoading(true);

    try {
      const updateData = {
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
          ...syndicator.verification_documents,
          past_deals: pastDeals
        },
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('syndicators')
        .update(updateData)
        .eq('id', syndicator.id)
        .eq('claimed_by', user.id) // Ensure user owns this syndicator
        .select()
        .single();

      if (error) throw error;

      // Show success with celebration
      toast.success('Profile saved successfully! 🎉', {
        duration: 2000,
        icon: '✅'
      });
      
      // Small delay before closing to let user see the success
      setTimeout(() => {
        onSave(data);
      }, 500);
    } catch (error) {
      console.error('Error updating syndicator profile:', error);
      toast.error('Error updating syndicator profile. Please try again.');
      setLoading(false);
    }
  };

  // Handler for logo upload with immediate feedback
  const handleLogoUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, companyLogoUrl: url }));
    if (url) {
      toast.success('Logo uploaded! Click "Save Changes" to apply.', {
        duration: 3000,
        icon: '🖼️'
      });
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

  if (!syndicator) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Syndicator Selected</h3>
          <p className="text-gray-600">Please select a syndicator to edit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Building2 className="h-6 w-6 text-purple-600 mr-3" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Edit Syndicator Profile</h2>
            <p className="text-gray-600">{syndicator.company_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {syndicator.verification_status === 'verified' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </span>
          )}
          {syndicator.verification_status === 'premier' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Premier
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            required
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            placeholder="Describe your company, investment strategy, and what makes you unique..."
          />
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
          <label className="block text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Company Logo
          </label>
          <ImageUpload
            currentImageUrl={formData.companyLogoUrl}
            onImageUploaded={handleLogoUploaded}
            bucket="logos"
            folder="companies"
            showEditor={true}
            circularCrop={false}
            cropAspectRatio={1}
            maxWidth={600}
            maxHeight={600}
            label="Company Logo"
          />
          <div className="mt-3 p-3 bg-white/70 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-purple-700">Pro tip:</span> Square logos (1:1) display best.
              Upload a high-resolution image for best results.
            </p>
          </div>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            placeholder="https://yourcompany.com"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            placeholder="https://linkedin.com/company/yourcompany"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Years in Business
            </label>
            <input
              type="number"
              value={formData.yearsInBusiness}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              min="0"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              min="0"
            />
          </div>
        </div>

        {/* Past Deals Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Past Deals</h3>
            <button
              type="button"
              onClick={() => setShowAddDeal(true)}
              className="flex items-center text-purple-600 hover:text-purple-700"
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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

        {/* Sticky Save Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 mt-6 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 hidden sm:block">
              Remember to save your changes before leaving
            </p>
            <div className="flex space-x-4 ml-auto">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition shadow-lg shadow-purple-500/25 font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
