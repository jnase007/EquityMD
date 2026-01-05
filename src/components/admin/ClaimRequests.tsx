import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, FileText, ExternalLink, User, UserCheck, Crown, Building2 } from 'lucide-react';

interface ClaimRequest {
  id: string;
  syndicator_id: string;
  requester_id: string;
  company_email: string;
  company_website: string;
  proof_documents: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  syndicator: {
    company_name: string;
    claimed_by: string | null;
    claimed_at: string | null;
    claimable: boolean;
  };
  requester: {
    full_name: string;
    email: string;
  };
  current_owner?: {
    full_name: string | null;
    email: string;
  } | null;
}

export function ClaimRequests() {
  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ClaimRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('syndicator_claim_requests')
        .select(`
          *,
          syndicator:syndicator_id (
            company_name,
            claimed_by,
            claimed_at,
            claimable
          ),
          requester:requester_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch current owner details for each syndicator
      const requestsWithOwners = await Promise.all(
        (data || []).map(async (request) => {
          let current_owner = null;
          if (request.syndicator?.claimed_by) {
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', request.syndicator.claimed_by)
              .single();
            current_owner = ownerData;
          }
          return { ...request, current_owner };
        })
      );

      console.log('Fetched claim requests:', requestsWithOwners?.length || 0);
      setRequests(requestsWithOwners);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('syndicator_claim_requests')
        .update({ 
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        // Send notification
        await supabase.functions.invoke('send-email', {
          body: {
            to: request.requester.email,
            subject: 'Syndicator Profile Claim Approved',
            content: `Your request to claim the ${request.syndicator.company_name} profile has been approved. An admin will assign ownership when ready.`,
            type: 'claim_approved'
          }
        });
      }

      // Refresh requests
      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Error processing claim request. Please try again.');
    }
  };

  const transferOwnership = async (syndicatorId: string, newOwnerId: string) => {
    try {
      // Update syndicator profile ownership
      const { error: syndicatorError } = await supabase
        .from('syndicator_profiles')
        .update({
          claimable: false,
          claimed_at: new Date().toISOString(),
          claimed_by: newOwnerId
        })
        .eq('id', syndicatorId);

      if (syndicatorError) throw syndicatorError;

      // Refresh requests to show updated ownership
      fetchRequests();
    } catch (error) {
      console.error('Error transferring ownership:', error);
      alert('Error transferring ownership. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading claim requests...</div>;
  }

  // Group requests by syndicator
  const groupedRequests = requests.reduce((acc, request) => {
    if (!acc[request.syndicator_id]) {
      acc[request.syndicator_id] = {
        syndicator: request.syndicator,
        current_owner: request.current_owner,
        requests: []
      };
    }
    acc[request.syndicator_id].requests.push(request);
    return acc;
  }, {} as Record<string, { syndicator: ClaimRequest['syndicator'], current_owner: ClaimRequest['current_owner'], requests: ClaimRequest[] }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="h-6 w-6 text-amber-200" />
            Claim Requests
          </h2>
          <p className="text-amber-100 text-sm mt-1">
            Review and process syndicator profile claim requests
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

      <div className="space-y-8">
        {Object.keys(groupedRequests).length > 0 ? (
          Object.entries(groupedRequests).map(([syndicatorId, group]) => (
            <div key={syndicatorId} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{group.syndicator.company_name}</h3>
                <div className="text-right">
                  {group.current_owner ? (
                    <div className="flex items-center text-sm text-green-600">
                      <Crown className="h-4 w-4 mr-1" />
                      <span className="font-medium">Owned by: {group.current_owner.full_name || group.current_owner.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span>Unclaimed</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {group.requests.map((request) => (
                  <div 
                    key={request.id}
                    className={`border rounded-lg p-4 ${
                      request.status === 'pending'
                        ? 'border-yellow-200 bg-yellow-50'
                        : request.status === 'approved'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            Requested by: {request.requester.full_name}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs flex items-center ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          Email: {request.company_email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          Website: 
                          <a 
                            href={request.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 ml-1 flex items-center"
                          >
                            {request.company_website}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {request.status === 'approved' && (
                          <button
                            onClick={() => transferOwnership(syndicatorId, request.requester_id)}
                            className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${
                              group.current_owner?.email === request.requester.email
                                ? 'bg-green-100 text-green-800 cursor-default'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                            disabled={group.current_owner?.email === request.requester.email}
                          >
                            {group.current_owner?.email === request.requester.email ? (
                              <>
                                <Crown className="h-3 w-3" />
                                Current Owner
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3" />
                                Set as Owner
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Notes
                          </label>
                          <textarea
                            value={selectedRequest?.id === request.id ? adminNotes : ''}
                            onChange={(e) => {
                              setSelectedRequest(request);
                              setAdminNotes(e.target.value);
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Add notes about this request..."
                          />
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => handleAction(request.id, 'rejected')}
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'approved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <div className="text-sm font-medium text-gray-700">Admin Notes:</div>
                        <div className="text-sm text-gray-600 mt-1">{request.admin_notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No claim requests found
          </div>
        )}
      </div>
      </div>
    </div>
  );
}