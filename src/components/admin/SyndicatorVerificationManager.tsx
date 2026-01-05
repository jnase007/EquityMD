import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SyndicatorProfile, SyndicatorVerificationHistory, Profile } from '../../types/database';
import { Shield, Star, CheckCircle, Clock, User, Calendar, FileText, AlertCircle } from 'lucide-react';

interface SyndicatorWithProfile extends SyndicatorProfile {
  profile: Profile;
}

export function SyndicatorVerificationManager() {
  const [syndicators, setSyndicators] = useState<SyndicatorWithProfile[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<SyndicatorVerificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSyndicator, setSelectedSyndicator] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSyndicators();
  }, [statusFilter]);

  const fetchSyndicators = async () => {
    try {
      let query = supabase
        .from('syndicator_profiles')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSyndicators(data || []);
    } catch (error) {
      console.error('Error fetching syndicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationHistory = async (syndicatorId: string) => {
    try {
      const { data, error } = await supabase
        .from('syndicator_verification_history')
        .select('*')
        .eq('syndicator_id', syndicatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerificationHistory(data || []);
    } catch (error) {
      console.error('Error fetching verification history:', error);
    }
  };

  const updateVerificationStatus = async (
    syndicatorId: string, 
    newStatus: string, 
    notes: string = ''
  ) => {
    setUpdating(syndicatorId);
    try {
      const { error } = await supabase
        .from('syndicator_profiles')
        .update({
          verification_status: newStatus,
          verification_notes: notes,
          verified_by: (await supabase.auth.getUser()).data.user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', syndicatorId);

      if (error) throw error;

      // Refresh the syndicators list
      await fetchSyndicators();
      
      // If this syndicator is selected, refresh their history
      if (selectedSyndicator === syndicatorId) {
        await fetchVerificationHistory(syndicatorId);
      }

      alert('Verification status updated successfully!');
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Error updating verification status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'premium':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'featured':
        return <Star className="h-4 w-4 text-orange-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'featured':
        return 'bg-orange-100 text-orange-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = syndicators.filter(s => s.verification_status === 'unverified').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-300" />
              Syndicator Verification
            </h2>
            <p className="text-purple-200 text-sm mt-1 max-w-xl">
              Review and manage syndicator verification statuses
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-xl px-4 py-2">
              <AlertCircle className="h-5 w-5 text-amber-300" />
              <span className="text-amber-100 font-medium">{pendingCount} pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="unverified">Unverified</option>
          <option value="verified">Verified</option>
          <option value="featured">Featured</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Syndicators List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syndicators.map((syndicator) => (
                <tr key={syndicator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {syndicator.company_logo_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={syndicator.company_logo_url}
                            alt={syndicator.company_name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {syndicator.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {syndicator.profile?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(syndicator.verification_status)}`}>
                      {getStatusIcon(syndicator.verification_status)}
                      {syndicator.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(syndicator.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {syndicator.verified_at 
                      ? new Date(syndicator.verified_at).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <select
                      value={syndicator.verification_status}
                      onChange={(e) => {
                        const notes = prompt('Add verification notes (optional):\n\nNote: Companies must claim their profile and complete background checks to be verified.') || '';
                        updateVerificationStatus(syndicator.id, e.target.value, notes);
                      }}
                      disabled={updating === syndicator.id}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Companies must claim their profile and complete background checks to be verified"
                    >
                      <option value="unverified">Unverified (Pending Claim & Verification)</option>
                      <option value="verified">Verified (Claimed & Background Checked)</option>
                      <option value="featured">Featured (Premium Status)</option>
                      <option value="premium">Premium Partner (Top Tier)</option>
                    </select>
                    <button
                      onClick={() => {
                        setSelectedSyndicator(syndicator.id);
                        fetchVerificationHistory(syndicator.id);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification History Modal */}
      {selectedSyndicator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Verification History</h3>
                <button
                  onClick={() => setSelectedSyndicator(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {verificationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No verification history found</p>
                ) : (
                  verificationHistory.map((entry) => (
                    <div key={entry.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-sm text-gray-600">
                          Status changed from{' '}
                          <span className="font-medium">{entry.previous_status || 'none'}</span>
                          {' '}to{' '}
                          <span className="font-medium">{entry.new_status}</span>
                        </span>
                      </div>
                      {entry.admin_notes && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                          {entry.admin_notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 