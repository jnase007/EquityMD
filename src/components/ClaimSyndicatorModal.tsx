import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface ClaimSyndicatorModalProps {
  syndicatorId: string;
  syndicatorName: string;
  onClose: () => void;
}

export function ClaimSyndicatorModal({ syndicatorId, syndicatorName, onClose }: ClaimSyndicatorModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    companyEmail: '',
    companyWebsite: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Submit claim request
      const { error: claimError } = await supabase
        .from('syndicator_claim_requests')
        .insert([{
          syndicator_id: syndicatorId,
          requester_id: user.id,
          company_email: formData.companyEmail,
          company_website: formData.companyWebsite,
          status: 'pending'
        }]);

      if (claimError) throw claimError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError('Error submitting claim request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Claim {syndicatorName} Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg">
              Your claim request has been submitted successfully. Our team will review your request and contact you shortly.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Email
                </label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Website
                </label>
                <input
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Claim Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}