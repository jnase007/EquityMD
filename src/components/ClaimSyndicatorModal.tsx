import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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

  // Normalize website URL - add https:// if missing
  const normalizeWebsite = (url: string): string => {
    if (!url) return '';
    url = url.trim();
    // If it doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to claim this profile.');
      return;
    }

    // Basic validation
    if (!formData.companyEmail.trim()) {
      setError('Please enter your company email.');
      return;
    }
    if (!formData.companyWebsite.trim()) {
      setError('Please enter your company website.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedWebsite = normalizeWebsite(formData.companyWebsite);
      
      // Submit claim request
      const { error: claimError } = await supabase
        .from('syndicator_claim_requests')
        .insert([{
          syndicator_id: syndicatorId,
          requester_id: user.id,
          company_email: formData.companyEmail.trim(),
          company_website: normalizedWebsite,
          status: 'pending'
        }]);

      if (claimError) {
        console.error('Claim error details:', claimError);
        // Check for specific errors
        if (claimError.code === '23505') {
          throw new Error('You have already submitted a claim request for this profile.');
        }
        if (claimError.code === '42P01') {
          throw new Error('System configuration error. Please contact support.');
        }
        throw new Error(claimError.message || 'Failed to submit claim request.');
      }

      // Also send notification email to admin
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'admin_claim_request',
            data: {
              syndicatorName,
              syndicatorId,
              requesterEmail: user.email,
              companyEmail: formData.companyEmail.trim(),
              companyWebsite: normalizedWebsite,
              requestDate: new Date().toLocaleDateString()
            }
          }
        });
      } catch (emailErr) {
        // Don't block on email failure
        console.log('Admin notification email failed (non-blocking):', emailErr);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting claim:', err);
      setError(err.message || 'Error submitting claim request. Please try again.');
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
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Claim request submitted!</p>
                <p className="text-sm mt-1">Our team will review your request and contact you shortly. This usually takes 1-2 business days.</p>
              </div>
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
                  placeholder="you@yourcompany.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Website
                </label>
                <input
                  type="text"
                  value={formData.companyWebsite}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  placeholder="yourcompany.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your domain (e.g., yourcompany.com) - we'll verify ownership
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Claim Request'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}