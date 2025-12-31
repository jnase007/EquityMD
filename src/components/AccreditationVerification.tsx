import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface AccreditationData {
  id: string;
  user_id: string;
  is_accredited: boolean;
  declared_at: string | null;
}

export function AccreditationVerification() {
  const { user, profile } = useAuthStore();
  const [accreditation, setAccreditation] = useState<AccreditationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAccreditationStatus();
    }
  }, [user]);

  async function fetchAccreditationStatus() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('investor_accreditation')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAccreditation(data);
      }
    } catch (error) {
      // No accreditation record yet
    } finally {
      setLoading(false);
    }
  }

  async function declareAccredited() {
    if (!user) return;

    setSaving(true);
    try {
      const accreditationData = {
        user_id: user.id,
        status: 'verified',
        method: 'self_declared',
        verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (accreditation) {
        const { error } = await supabase
          .from('investor_accreditation')
          .update(accreditationData)
          .eq('id', accreditation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investor_accreditation')
          .insert(accreditationData);

        if (error) throw error;
      }

      toast.success('Accreditation confirmed!');
      fetchAccreditationStatus();
    } catch (error: any) {
      console.error('Error saving accreditation:', error);
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    );
  }

  // Already declared
  if (accreditation?.status === 'verified') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Accredited Investor</h3>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-green-700">
              You've confirmed your accredited investor status
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not yet declared
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Accredited Investor Status</h3>
          <p className="text-sm text-gray-600 mb-4">
            Real estate syndications are typically offered only to accredited investors under SEC regulations.
          </p>
          
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>You qualify as accredited if you meet any of:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Income over $200K (or $300K with spouse) for past 2 years</li>
              <li>• Net worth over $1 million (excluding primary residence)</li>
              <li>• Hold Series 7, 65, or 82 license</li>
              <li>• Entity with assets over $5 million</li>
            </ul>
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
            <input
              type="checkbox"
              onChange={(e) => e.target.checked && declareAccredited()}
              disabled={saving}
              className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">I confirm I am an accredited investor</span>
              <p className="text-xs text-gray-500 mt-1">
                Individual syndicators may require additional verification before accepting your investment.
              </p>
            </div>
          </label>
          
          <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              This is a self-declaration for platform purposes only. Each syndicator handles their own investor verification and legal documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
