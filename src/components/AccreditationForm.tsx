import React, { useState } from 'react';
import { CheckCircle, AlertCircle, DollarSign, FileText, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface AccreditationFormProps {
  onVerify: () => void;
  onClose: () => void;
}

export function AccreditationForm({ onVerify, onClose }: AccreditationFormProps) {
  const { user, profile, setProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    income: null as boolean | null,
    netWorth: null as boolean | null,
    license: null as boolean | null,
    confirmAccuracy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEligible = formData.income || formData.netWorth || formData.license;

  const handleSubmit = async () => {
    if (!isEligible) {
      setError('You must meet at least one accreditation requirement to proceed.');
      return;
    }

    if (!formData.confirmAccuracy) {
      setError('You must confirm the accuracy of your information.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update user profile with accreditation status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          accredited_status: true,
          verification_date: new Date().toISOString(),
          accreditation_criteria: {
            income: formData.income,
            netWorth: formData.netWorth,
            license: formData.license
          }
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          accredited_status: true,
          verification_date: new Date().toISOString()
        });
      }

      onVerify();
    } catch (err) {
      console.error('Error updating accreditation status:', err);
      setError('Failed to update accreditation status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Verify Accredited Investor Status</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">SEC Accredited Investor Requirements</p>
                <p>
                  To access syndicator contact information, you must meet at least one of the following criteria 
                  as defined by SEC regulations.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Income Criteria */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Income Test</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Individual income exceeding $200,000 in each of the two most recent years, or joint income 
                with spouse exceeding $300,000 in each of those years, with reasonable expectation of reaching 
                the same income level in the current year.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Do you meet the income requirements?
                </label>
                <select
                  value={formData.income === null ? '' : formData.income ? 'yes' : 'no'}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    income: e.target.value === '' ? null : e.target.value === 'yes' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Net Worth Criteria */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Net Worth Test</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Individual or joint net worth with spouse exceeding $1 million at the time of purchase, 
                excluding the value of primary residence.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Do you meet the net worth requirements?
                </label>
                <select
                  value={formData.netWorth === null ? '' : formData.netWorth ? 'yes' : 'no'}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    netWorth: e.target.value === '' ? null : e.target.value === 'yes' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* License Criteria */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Professional License</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Hold in good standing a Series 7, 65, or 82 license or other qualifying professional certification.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Do you hold a qualifying license?
                </label>
                <select
                  value={formData.license === null ? '' : formData.license ? 'yes' : 'no'}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    license: e.target.value === '' ? null : e.target.value === 'yes' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Accuracy Confirmation */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.confirmAccuracy}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    confirmAccuracy: e.target.checked 
                  }))}
                  className="mt-1 mr-3"
                />
                <div className="text-sm">
                  <span className="text-gray-900 font-medium">
                    I certify that the information provided above is true and accurate.
                  </span>
                  <p className="text-gray-600 mt-1">
                    I understand that providing false information may violate federal securities laws and 
                    could result in civil and criminal penalties.
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            {isEligible && formData.confirmAccuracy && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 text-sm font-medium">
                    You meet the accredited investor requirements
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isEligible || !formData.confirmAccuracy || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Status'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Disclaimer:</strong> EquityMD is a marketplace only. We do not verify, endorse, or guarantee 
              any syndicator or investment opportunity. All transactions occur off-platform. You are solely responsible 
              for conducting your own due diligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 