import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Crown, Search, Save, AlertCircle } from 'lucide-react';
import { VerificationBadge, VerificationStatus } from './VerificationBadge';
import { supabase } from '../lib/supabase';

interface SyndicatorAdmin {
  id: string;
  company_name: string;
  email: string;
  verification_status: VerificationStatus;
  created_at: string;
  last_updated: string;
  deal_count: number;
}

export function SyndicatorVerificationAdmin() {
  const [syndicators, setSyndicators] = useState<SyndicatorAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSyndicators();
  }, []);

  const fetchSyndicators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .select(`
          id,
          company_name,
          verification_status,
          created_at,
          updated_at,
          profiles!syndicator_profiles_id_fkey (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data and get deal counts
      const transformedData = await Promise.all(
        (data || []).map(async (syndicator) => {
          // Get deal count for each syndicator
          const { count } = await supabase
            .from('deals')
            .select('*', { count: 'exact', head: true })
            .eq('syndicator_id', syndicator.id);

          return {
            id: syndicator.id,
            company_name: syndicator.company_name,
            email: Array.isArray(syndicator.profiles) ? syndicator.profiles[0]?.email || 'No email' : syndicator.profiles?.email || 'No email',
            verification_status: (syndicator.verification_status || 'unverified') as VerificationStatus,
            created_at: syndicator.created_at,
            updated_at: syndicator.updated_at,
            deal_count: count || 0
          };
        })
      );

      setSyndicators(transformedData);
    } catch (error) {
      console.error('Error fetching syndicators:', error);
      setMessage({ type: 'error', text: 'Failed to load syndicators' });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (syndicatorId: string, newStatus: VerificationStatus) => {
    setUpdating(syndicatorId);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('syndicator_profiles')
        .update({
          verification_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', syndicatorId);

      if (error) throw error;

      // Update local state
      setSyndicators(prev => prev.map(syndicator =>
        syndicator.id === syndicatorId
          ? { ...syndicator, verification_status: newStatus, last_updated: new Date().toISOString() }
          : syndicator
      ));

      setMessage({ type: 'success', text: 'Verification status updated successfully' });
    } catch (error) {
      console.error('Error updating verification status:', error);
      setMessage({ type: 'error', text: 'Failed to update verification status' });
    } finally {
      setUpdating(null);
    }
  };

  const filteredSyndicators = syndicators.filter(syndicator =>
    syndicator.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    syndicator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    unverified: syndicators.filter(s => s.verification_status === 'unverified').length,
    verified: syndicators.filter(s => s.verification_status === 'verified').length,
    premier: syndicators.filter(s => s.verification_status === 'premier').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading syndicators...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Syndicator Verification Management</h2>
        
        {/* Status Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{syndicators.length}</div>
            <div className="text-sm text-gray-600">Total Syndicators</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-500">{statusCounts.unverified}</div>
            <div className="text-sm text-gray-600">Unverified</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.verified}</div>
            <div className="text-sm text-blue-600">Verified</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.premier}</div>
            <div className="text-sm text-yellow-600">Premier Partners</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <AlertCircle className={`h-5 w-5 mr-2 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Syndicators Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Update Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSyndicators.map((syndicator) => (
              <tr key={syndicator.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{syndicator.company_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{syndicator.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <VerificationBadge status={syndicator.verification_status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{syndicator.deal_count}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={syndicator.verification_status}
                    onChange={(e) => updateVerificationStatus(syndicator.id, e.target.value as VerificationStatus)}
                    disabled={updating === syndicator.id}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="unverified">Unverified</option>
                    <option value="verified">Verified</option>
                    <option value="premier">Premier Partner</option>
                  </select>
                  {updating === syndicator.id && (
                    <div className="inline-block ml-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(syndicator.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSyndicators.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No syndicators found matching your search.</p>
          </div>
        )}
      </div>

      {/* Premier Partner Management */}
      <div className="p-6 border-t border-gray-200 bg-yellow-50">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Premier Partner Guidelines</h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>• <strong>Premier Partners</strong> are featured syndicators with proven track records</p>
          <p>• Suggested Premier Partners: Back Bay Capital, Sutera Properties, Starboard Real Estate</p>
          <p>• Premier status should be reserved for syndicators with multiple successful deals</p>
          <p>• Regular review of Premier status is recommended based on performance</p>
        </div>
      </div>
    </div>
  );
} 