import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, DollarSign, Clock, TrendingUp, ListPlus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { DealMediaUpload } from '../components/DealMediaUpload';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

export function NewDeal() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: '',
    location: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    investmentHighlights: [''],
    minimumInvestment: '',
    targetIrr: '',
    investmentTerm: '',
    totalEquity: '',
    coverImageUrl: ''
  });

  const propertyTypes = [
    'Multi-Family',
    'Office',
    'Retail',
    'Industrial',
    'Medical',
    'Student Housing'
  ];

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.investmentHighlights];
    newHighlights[index] = value;
    setFormData(prev => ({ ...prev, investmentHighlights: newHighlights }));
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      investmentHighlights: [...prev.investmentHighlights, '']
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      investmentHighlights: prev.investmentHighlights.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to create a deal.');
      return;
    }

    console.log('Creating deal with user:', user.id);
    console.log('Form data:', formData);
    
    setLoading(true);
    try {
      // Prepare deal data
      const dealData = {
        syndicator_id: user.id,
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType,
        location: formData.location,
        address: formData.address,
        investment_highlights: formData.investmentHighlights.filter(Boolean),
        minimum_investment: parseFloat(formData.minimumInvestment),
        target_irr: parseFloat(formData.targetIrr),
        investment_term: parseInt(formData.investmentTerm),
        total_equity: parseFloat(formData.totalEquity),
        cover_image_url: formData.coverImageUrl,
        status: 'draft'
      };

      console.log('Inserting deal data:', dealData);

      // Create the deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert(dealData)
        .select('*')
        .single();

      console.log('Insert result - data:', deal, 'error:', dealError);

      if (dealError) {
        console.error('Error creating deal:', dealError);
        return
      }

      navigate(`/deals/${deal.slug}`);
    } catch (error: any) {
      console.error('Error creating deal:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error creating deal. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = 'Permission denied. Please ensure you have syndicator privileges.';
        } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorMessage = 'A deal with this title already exists. Please use a different title.';
        } else if (error.message.includes('invalid') || error.message.includes('constraint')) {
          errorMessage = 'Please check all required fields and try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Investment Opportunity</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Property Type</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Investment Highlights */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Investment Highlights</h2>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <ListPlus className="h-5 w-5 mr-1" />
                  Add Highlight
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.investmentHighlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter an investment highlight"
                    />
                    {formData.investmentHighlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Investment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Investment ($)
                  </label>
                  <input
                    type="number"
                    value={formData.minimumInvestment}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumInvestment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target IRR (%)
                  </label>
                  <input
                    type="number"
                    value={formData.targetIrr}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetIrr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Term (years)
                  </label>
                  <input
                    type="number"
                    value={formData.investmentTerm}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentTerm: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Equity ($)
                  </label>
                  <input
                    type="number"
                    value={formData.totalEquity}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalEquity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Cover Image</h2>
              <input
                type="url"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter cover image URL"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}